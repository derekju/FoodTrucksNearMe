<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/../config/config.php');

// Sanitize params
$neLat = floatval($_GET['neLat']);
$neLng = floatval($_GET['neLng']);
$swLat = floatval($_GET['swLat']);
$swLng = floatval($_GET['swLng']);

$data = FoodTruckFinder::getTrucksInBounds($neLat, $neLng, $swLat, $swLng);

header('Content-type: application/json');
echo $data;