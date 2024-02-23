<?php

namespace App\Database\AvoidSqlServerError;

use PDO;
use Illuminate\Database\Connectors\ConnectorInterface;
use Illuminate\Database\Connectors\SqlServerConnector;


class SqlServerErrAvoidConnector extends SqlServerConnector implements ConnectorInterface
{
    /**
     * Establish a database connection.
     *
     * @param  array  $config
     * @return \PDO
     */
    public function connect(array $config)
    {
        $options = $this->getOptions($config);

        if (array_key_exists(PDO::ATTR_STRINGIFY_FETCHES, $options)) {
            unset($options[PDO::ATTR_STRINGIFY_FETCHES]);
        }

        $connection = $this->createConnection($this->getDsn($config), $config, $options);

        $this->configureIsolationLevel($connection, $config);

        return $connection;
    }
}