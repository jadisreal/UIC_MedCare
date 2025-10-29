<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $count = DB::table('medicine_stock_out')->count();
    echo "stock_out_count: {$count}\n";

    $rows = DB::table('medicine_stock_out as mso')
        ->join('medicine_stock_in as msi', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
        ->leftJoin('medicines as m', 'm.medicine_id', '=', 'msi.medicine_id')
        ->select(DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id)) as name"), DB::raw('SUM(mso.quantity_dispensed) as total'), 'm.medicine_category as category')
        ->groupBy(DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id))"), 'm.medicine_category')
        ->orderByDesc('total')
        ->limit(20)
        ->get();

    foreach ($rows as $r) {
        $cat = $r->category ?? 'Uncategorized';
        echo "{$r->name} ({$cat}) => {$r->total}\n";
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
