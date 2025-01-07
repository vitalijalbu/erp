<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\Activitylog\Contracts\Activity as ContractsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;

trait LogsActivity 
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected function getAllRelations()
    {
        $reflector = new \ReflectionClass($this);
        $relations = [];
        foreach ($reflector->getMethods() as $reflectionMethod) {
            $returnType = $reflectionMethod->getReturnType();
            if ($returnType) {
                $relationType = class_basename($returnType->getName());
                if(in_array($relationType, ['HasOne', 'HasMany', 'BelongsTo', 'BelongsToMany', 'MorphToMany', 'MorphTo'])) {
                    $relations[] = ['type' => $relationType, 'name' => $reflectionMethod->getName()];
                }
            }
        }

        return $relations;
    }

    protected function creation(): Attribute
    {
        return Attribute::make(
            get: function () {
                $mainActivity = $this->activities()
                    ->where('event', 'created')
                    ->orderBy('id', 'desc')->first();
                
                if(!$mainActivity) {
                    return null;
                }    

                $relations = $this->getAllRelations();
                $relationActivities = [];

                if($mainActivity->batch_uuid) {
                    foreach($relations as $relation) {
                        $relationClass = ($this->{$relation['name']}());
                        $relationType = $relation['type'];
                        switch($relationType) {
                            case 'BelongsToMany':
                                $pivotClass = $relationClass->getPivotClass(); 
                                if($pivotClass) {
                                    $relationActivities[$relation['name']] = Activity::where('subject_type', $pivotClass)
                                        ->where(function($q) use ($relationClass) {
                                            $q->where("properties->attributes->".$relationClass->getForeignPivotKeyName(), $this->{$this->primaryKey})
                                                ->orWhere("properties->old->".$relationClass->getForeignPivotKeyName(), $this->{$this->primaryKey});
                                        })
                                        ->where('batch_uuid', $mainActivity->batch_uuid)
                                        ->get()
                                        ->all();
                                }
                            case 'MorphToMany':
                                $pivotClass = $relationClass->getPivotClass(); 
                                if($pivotClass) {
                                    $relationActivities[$relation['name']] = Activity::where('subject_type', $pivotClass)
                                        ->where(function($q) {
                                            $q->where("properties->attributes->model_id", $this->{$this->primaryKey})
                                                ->orWhere("properties->old->model_id", $this->{$this->primaryKey});
                                        })
                                        ->where('batch_uuid', $mainActivity->batch_uuid)
                                        ->get()
                                        ->all();
                                }
                        }
                    }
                }

                $result['model'] = $mainActivity;
                $result['relations'] = $relationActivities;

                return $this->logsActivityFormatResult($result);
            }
        );
    }

    protected function lastModification(): Attribute
    {
        return Attribute::make(
            get: function () {
                //get the last event on the main model
                $mainActivity = $this->activities()->orderBy('id', 'desc')->first();
                $relations = $this->getAllRelations();
                $relationActivities = [];
                foreach($relations as $relation) {
                    //get the latest event for each relationship
                    $relationClass = ($this->{$relation['name']}());
                    $relationType = $relation['type'];
                    switch($relationType) {
                        case 'BelongsToMany':
                            $pivotClass = $relationClass->getPivotClass(); 
                            if($pivotClass) {
                                $baseQuery = Activity::where('subject_type', $pivotClass)
                                    ->where(function($q) use ($relationClass) {
                                        $q->where("properties->attributes->".$relationClass->getForeignPivotKeyName(), $this->{$this->primaryKey})
                                            ->orWhere("properties->old->".$relationClass->getForeignPivotKeyName(), $this->{$this->primaryKey});
                                    });
                                    
                                $q = $baseQuery
                                    ->getQuery()
                                    ->selectRaw('FIRST_VALUE(batch_uuid) OVER (order by id desc) latest_batch, *')
                                    ->whereNotNull('batch_uuid');
                                
                                //get all event of the latest batch
                                $relationActivities[$relation['name']] = Activity::query()->hydrate(
                                    Activity::query()->getQuery()->from($q, 't')->whereColumn('batch_uuid', 'latest_batch')->get()->toArray()
                                );
                            }
                            break;
                        case 'MorphToMany':
                            $pivotClass = $relationClass->getPivotClass(); 
                            if($pivotClass) {
                                $baseQuery = Activity::where('subject_type', $pivotClass)
                                    ->where(function($q) {
                                        $q->where("properties->attributes->model_id", $this->{$this->primaryKey})
                                            ->orWhere("properties->old->model_id", $this->{$this->primaryKey});
                                    });
                                    
                                $q = $baseQuery
                                    ->getQuery()
                                    ->selectRaw('FIRST_VALUE(batch_uuid) OVER (order by id desc) latest_batch, *')
                                    ->whereNotNull('batch_uuid');
                                
                                //get all event of the latest batch
                                $relationActivities[$relation['name']] = Activity::query()->hydrate(
                                    Activity::query()->getQuery()->from($q, 't')->whereColumn('batch_uuid', 'latest_batch')->get()->toArray()
                                );
                                
                            }
                    }
                }

                //get the latest batch between relationship events and main event
                $latestBatch = collect($relationActivities)
                    ->flatten(1)
                    ->sortByDesc(function($e, $k) {
                        return $e['created_at'];
                    })
                    ->first();

                
                $latestRelationActivities = collect($relationActivities)
                    ->map(fn($e, $k) => $e->filter(fn($activity) => $activity->batch_uuid == $latestBatch->batch_uuid)->all() )
                    ->all();
                

                $result = [
                    'model' => null,
                    'relations' => []
                ];

                //if the relationship events have the same batch of the main event
                if($mainActivity?->batch_uuid == $latestBatch?->batch_uuid) {
                    $result['model'] = $mainActivity;
                    $result['relations'] = $latestRelationActivities;
                }
                //if the main event batch is newer that relationship events
                elseif($mainActivity?->created_at > $latestBatch?->created_at) {
                    $result['model'] = $mainActivity;
                }
                else {
                    $result['relations'] = $latestRelationActivities;
                }

                return $this->logsActivityFormatResult($result);
            }
        );
    }

    
    protected function logsActivityFormatResult($result)
    {
        $format = function(Activity $activity, $relation = null) {
            $act = [
                'event' => $activity->event,
                'time' => $activity->created_at,
                'causer' => $activity->causer
            ];
            $relationType = $relation ? class_basename($this->{$relation}()::class) : null;
            
            switch($relationType) {
                case 'BelongsToMany':
                case 'MorphToMany':
                    $relatedKey = $this->{$relation}()->getRelatedPivotKeyName();
                    $act['changes'] = [
                        $relatedKey => [
                            'new' => !empty($activity->properties['attributes'][$relatedKey]) ?
                                $this->{$relation}()->getModel()->find(
                                    $activity->properties['attributes'][$relatedKey]
                                ) : null, 
                            'old' => !empty($activity->properties['old'][$relatedKey]) ?
                                $this->{$relation}()->getModel()->find(
                                    $activity->properties['old'][$relatedKey]
                                ) : null,
                        ]
                    ];
                    break;
                default:
                    //main model
                    $props = array_merge(
                        array_keys($activity->properties['attributes'] ?? []),
                        array_keys($activity->properties['old'] ?? [])
                    );
                    $changes = array_combine($props, $props);
                    $foreignKeyProps = collect($this->getAllRelations())
                        ->where('type', 'BelongsTo')
                        ->map(fn($relation) => [
                            'key' => $this->{$relation['name']}()->getForeignKeyName(),
                            'relation' => $relation['name']
                        ])
                        ->keyBy('key')
                        ->all();

                    $foreignKeyPropsKey = array_keys($foreignKeyProps);

                    $act['changes'] = array_map(
                        function($prop) use ($activity, $foreignKeyProps, $foreignKeyPropsKey) {
                            //if the field is a belongsto foreign key, load the related model information
                            if(in_array($prop, $foreignKeyPropsKey)) {
                                $new = !empty($activity->properties['attributes'][$prop]) ? 
                                $this->{$foreignKeyProps[$prop]['relation']}()->getModel()->find(
                                    $activity->properties['attributes'][$prop]
                                )
                                :null;
                                
                                $old = !empty($activity->properties['old'][$prop]) ? 
                                $this->{$foreignKeyProps[$prop]['relation']}()->getModel()->find(
                                    $activity->properties['old'][$prop]
                                )
                                :null;
                            }
                            else {
                                $new = $activity->properties['attributes'][$prop] ?? null;
                                $old = $activity->properties['old'][$prop] ?? null;
                            }

                            return [
                                'new' => $new, 
                                'old' => $old
                            ];
                        },
                        $changes,
                    );
            }

            return $act;
        };

        $finalResult = [];

        if($result['model']) {
            $finalResult['model'] = $format($result['model']);
        }
        $formattedRelations = [];
        foreach($result['relations'] as $relation => $relationActivities) {
            if(!empty($relationActivities)) {
                $formattedRelations[$relation] = array_map(
                    fn($activity) => $format($activity, $relation), 
                    $relationActivities
                );
            }
        }
        if(!empty($formattedRelations)) {
            $finalResult['relations'] = $formattedRelations;
        }

        return $finalResult;
    }
    
}