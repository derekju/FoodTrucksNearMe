<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/../config/config.php');

// Sanitize params
$neLat = floatval($_POST['neLat']);
$neLng = floatval($_POST['neLng']);
$swLat = floatval($_POST['swLat']);
$swLng = floatval($_POST['swLng']);

$data = FoodTruckFinder::getTrucksInBounds($neLat, $neLng, $swLat, $swLng);

echo $data;