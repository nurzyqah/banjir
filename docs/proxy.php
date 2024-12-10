<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

// Clear any previous output
while (ob_get_level()) {
    ob_end_clean();
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

$api_url = 'https://infobencanajkmv2.jkm.gov.my/api/data-dashboard-table-pps.php';

try {
    // Set up the stream context
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                'Accept: application/json',
                'Referer: https://infobencanajkmv2.jkm.gov.my/landing/'
            ],
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];

    $context = stream_context_create($opts);
    
    // Fetch the data
    $response = @file_get_contents($api_url, false, $context);
    
    if ($response === false) {
        // Check for HTTP response header
        $status_line = $http_response_header[0] ?? '';
        preg_match('{HTTP\/\S*\s(\d{3})}', $status_line, $match);
        $status = $match[1] ?? '500';
        throw new Exception("HTTP request failed with status: " . $status);
    }

    // For now, return sample data to test the frontend
    $sample_data = [
        [
            'nama_pps' => 'SK KAMPUNG JAWA, KLANG',
            'daerah' => 'KLANG',
            'negeri' => 'SELANGOR',
            'jumlah_mangsa' => 50,
            'jumlah_keluarga' => 15,
            'status' => 'Active'
        ],
        [
            'nama_pps' => 'SK TELOK GONG, KLANG',
            'daerah' => 'KLANG',
            'negeri' => 'SELANGOR',
            'jumlah_mangsa' => 30,
            'jumlah_keluarga' => 8,
            'status' => 'Active'
        ],
        [
            'nama_pps' => 'DEWAN ORANG RAMAI PANDAMARAN',
            'daerah' => 'KLANG',
            'negeri' => 'SELANGOR',
            'jumlah_mangsa' => 45,
            'jumlah_keluarga' => 12,
            'status' => 'Active'
        ]
    ];

    echo json_encode($sample_data);
    exit();

} catch (Exception $e) {
    error_log("Proxy error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
    exit();
}
