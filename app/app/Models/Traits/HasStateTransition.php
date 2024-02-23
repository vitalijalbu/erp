<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Workflow\Definition;
use Symfony\Component\Workflow\Transition;
use Symfony\Component\Workflow\Workflow;
use Symfony\Component\Workflow\Marking;
use Symfony\Component\Workflow\MarkingStore\MarkingStoreInterface;

trait HasStateTransition {

    public function canSetState($state)
    {
        $stateManager = $this->getStateManager();

        return $stateManager->can($this, $state);
    }

    protected function availableStateTransitions(): Attribute
    {
        return Attribute::make(
            get: function() {
                $transitions = collect($this->getStateManager()->getEnabledTransitions($this));
                return $transitions->reduce(function ($carry, $item) {
                    return array_merge($carry, $item->getTos());
                }, []);
            }
        );
    }

    protected function makeStateManager(Definition $definition, $field)
    {
        $workflow = new Workflow($definition, new class($field) implements MarkingStoreInterface {

            public function __construct(protected $field)
            {
                
            }

            public function setMarking(object $subject, Marking $marking, array $context = []) {

            }

            public function getMarking(object $subject): Marking {
                return $subject->{$this->field} ? (new Marking([$subject->{$this->field}->value => 1])) : (new Marking());
            }
        });

        return $workflow;
    }

}