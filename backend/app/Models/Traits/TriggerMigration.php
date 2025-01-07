<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\DB;

trait TriggerMigration
{
    public function createTrigger($tableName, $pkName, $fkName)
    {
        $triggerName = $tableName."_custom_id";

        $this->deleteTrigger($triggerName);

        DB::statement("
            
            CREATE TRIGGER {$triggerName} ON {$tableName}
            INSTEAD OF INSERT
            
            AS 
            DECLARE @i INT;
            DECLARE @n_rows INT;    
            DECLARE @id NVARCHAR(200) = NULL;
            DECLARE @companyId INT = NULL;
            BEGIN
                SET NOCOUNT ON;
                
                SET @i = 0;
                SET @n_rows = (SELECT COUNT(*) FROM inserted);
            
                WHILE(@i < @n_rows)
                    BEGIN
                    SELECT * INTO #tmp FROM (SELECT * FROM inserted ORDER BY (SELECT NULL) OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY) b;
                    SET @companyId = (SELECT {$fkName} FROM #tmp)
                    SET @id = (SELECT {$pkName} FROM #tmp)
                    IF @id IS NULL AND @companyId IS NOT NULL
                        BEGIN
                        EXEC next_table_id @companyId, N'{$tableName}', @id OUTPUT
                        UPDATE #tmp SET {$pkName} = @id
                        END
                    
                    INSERT INTO {$tableName} SELECT * FROM #tmp;
            
                    DROP TABLE #tmp;
                    SET @i = @i + 1;
                END
            END;
        ");

    }

    public function deleteTrigger($tableName)
    {
        $triggerName = $tableName."_custom_id";

        DB::statement("DROP TRIGGER IF EXISTS {$triggerName};");
    }
}