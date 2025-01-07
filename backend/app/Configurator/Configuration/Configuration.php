<?php

namespace App\Configurator\Configuration;

use App\Models\StandardProduct;
use Illuminate\Support\Facades\Validator;

/**
 * This class represent the server side product configuration, received from the constraint engine
 */
class Configuration
{
    protected static $MAIN_PRODUCT_ATTRIBUTE_ID = 'main_product';

    protected $featuresConfiguration = [];

    protected $latestErrors = [];

    public function __construct(
        protected StandardProduct $product, 
        protected array $configuration,
    )
    {
        $this->featuresConfiguration = $this->product->configurationFeatures()->with(['feature', 'featureAttribute'])->get()->keyBy('feature_id')->toArray();
        $this->normalize();
    }


    public function getConfiguration()
    {
        return $this->configuration;
    }

    protected function normalize()
    {
        foreach($this->getFeatures() as $feature => $value) {
            if(isset($this->featuresConfiguration[$feature])) {
                if($this->featuresConfiguration[$feature]['multiple'] && !is_array($value)) {
                    $this->setFeature($feature, [$value]);
                }
            }
        }
    }

    public function isValid(): bool
    {
        if(!empty($this->configuration['invalid_features'])) {
            return false;
        }

        $validationRules = [];
        foreach($this->getFeatures() as $feature => $value) {
            if(!isset($this->featuresConfiguration[$feature])) {
                return false;
            }
            $featureRules = [];
            switch($this->featuresConfiguration[$feature]['feature']['feature_type_id']) {
                case 'bool':
                    $featureRules = ['nullable', 'boolean'];
                    break;
                case 'decimal':
                    $featureRules = ['nullable', 'decimal:0,10'];
                    break;
                case 'int':
                    $featureRules = ['nullable', 'integer'];
                    break;
                case 'dropdown':
                case 'product':
                    $featureRules = ['nullable', 'string'];
                    break;
                case 'text':
                case 'multiline_text':
                    $featureRules = ['nullable', 'string'];
                    break;
            }
            if($this->featuresConfiguration[$feature]['multiple']) {
                $validationRules[$feature] = ['nullable', 'array'];
                $validationRules[$feature.'.*'] = $featureRules;
            }
            else {
                $validationRules[$feature] = $featureRules;
            }
        }

        $validator = Validator::make($this->getFeatures(), $validationRules);
        $this->latestErrors = $validator->errors();
        return !$validator->fails();
    }

    public function getLatestErrors()
    {
        return $this->latestErrors;
    }

    public function getFeatures(): array
    {
        return $this->configuration['features'];
    }

    public function hasFeature($feature): bool
    {
        return array_key_exists($feature, $this->getFeatures());
    }

    public function getFeature($feature)
    {
        return $this->getFeatures()[$feature];
    }

    public function setFeature($feature, $value)
    {
        if(!isset($this->configuration['features'])) {
            $this->configuration['features'] = [];
        }
        return $this->configuration['features'][$feature] = $value;
    }

    public function getDatasets(): array
    {
        return $this->configuration['dataset'];
    }

    public function getConfigurationData()
    {
        return [
            'features' => $this->getFeatures(),
            'selected_options' => $this->extractSelectedOptions(),
            'features_configuration' => $this->featuresConfiguration
        ];
    }

    /**
     * this method is used for extracting the selected option for the features that are using a dataset.
     * The selected options are used for transform the selected value into a human readable label
     */
    protected function extractSelectedOptions()
    {
        $this->product->loadMissing(['configurationFeatures'])->with('features.featureType');
        $selectedOptions = [];
        
        foreach($this->getDatasets() as $feature => $dataset) {
            if(isset($this->featuresConfiguration[$feature]) && $this->hasFeature($feature)) {
                $values = $this->getFeature($feature);
                $values = $this->featuresConfiguration[$feature]['multiple'] ? $values : [$values];
                
                if($dataset['type'] == 'list') {
                    foreach($values as $value) {
                        if(array_key_exists($value, $dataset['data'])) {
                            $selectedOptions[$feature]['values'][$value] = (string) $dataset['data'][$value];
                        }
                    }
                }
                elseif($dataset['type'] == 'table') {
                    $labelColumn = $dataset['columns'][1] ?? null;
                    $idColumn = $dataset['columns'][0] ?? null;
                    
                    if($labelColumn && $idColumn) {
                        $datasetCollection = collect($dataset['data']);
                        foreach($values as $value) {
                            $item = $datasetCollection->firstWhere($idColumn['name'], $value);
                            
                            if($item) {
                                $selectedOptions[$feature]['values'][$value] = $item[$labelColumn['name']] ?? $value;
                            }
                        }
                    }
                }
            }
        }
        
        return $selectedOptions;
    }

    public function getBaseItem()
    {
        foreach($this->featuresConfiguration as $feature => $featureData) {
            if($featureData['feature_attribute_id'] == static::$MAIN_PRODUCT_ATTRIBUTE_ID) {
                if($this->hasFeature($feature)) {
                    return $this->getFeature($feature);
                }

                return null;
            }
        }

        return null;
    }
}