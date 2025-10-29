<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MedicineController extends Controller
{
    /**
     * Return aggregated medicine stock-out totals grouped by medicine name.
     *
     * Expected return shape: [ { name: string, medicine_stock_out: int, color?: string }, ... ]
     */
    public function stockOut(Request $request)
    {
        try {
            // Attempt to join the stock-out -> stock-in -> medicines tables.
            // Optional filters: user_id (who performed the stock-out), month and year
            $userId = $request->query('user_id');
            $month = $request->query('month');
            $year = $request->query('year');

            $query = DB::table('medicine_stock_out as mso')
                ->join('medicine_stock_in as msi', 'msi.medicine_stock_in_id', '=', 'mso.medicine_stock_in_id')
                ->leftJoin('medicines as m', 'm.medicine_id', '=', 'msi.medicine_id')
                ->select(
                    DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id)) as name"),
                    DB::raw('SUM(mso.quantity_dispensed) as medicine_stock_out'),
                    DB::raw('NULL as category'),
                    DB::raw('NULL as color')
                );

            if ($userId) {
                $query->where('mso.user_id', $userId);
            }

            // Filter by month/year of the timestamp_dispensed if provided.
            // Accept numeric month (1-12) and numeric year (e.g., 2025).
            if (!empty($month) && is_numeric($month)) {
                $m = intval($month);
                if ($m >= 1 && $m <= 12) {
                    $query->whereRaw('MONTH(mso.timestamp_dispensed) = ?', [$m]);
                }
            }

            if (!empty($year) && is_numeric($year)) {
                $y = intval($year);
                $query->whereRaw('YEAR(mso.timestamp_dispensed) = ?', [$y]);
            }

            $rows = $query
                ->groupBy(DB::raw("COALESCE(m.medicine_name, CONCAT('Medicine #', msi.medicine_id))"))
                ->orderByDesc('medicine_stock_out')
                ->get()
                ->map(function ($r) {
                    return [
                        'name' => $r->name,
                        'medicine_stock_out' => (int) $r->medicine_stock_out,
                        'category' => null,
                        'color' => null,
                    ];
                })
                ->values();

            return response()->json($rows);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}