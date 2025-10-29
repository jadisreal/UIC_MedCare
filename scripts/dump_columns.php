<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = ['medicine_stock_in','medicine_stock_out','medicines'];
foreach($tables as $t) {
    echo "Columns for {$t}:\n";
    $cols = DB::select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [$t]);
    foreach($cols as $c) echo " - {$c->COLUMN_NAME}\n";
    echo "\n";
}
