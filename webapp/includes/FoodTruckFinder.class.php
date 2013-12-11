<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/../config/config.php');

class FoodTruckFinder {

	public static function getTrucksInBounds($neLat, $neLng, $swLat, $swLng) {
		$curlWrapper = new CurlWrapper();

		$queryData = array(
			'status' => 'APPROVED',
			'$where' => "latitude>$swLat and latitude<$neLat and longitude>$swLng and longitude<$neLng",
			'$select' => 'latitude,longitude,applicant,fooditems',
			'$group' => 'latitude,longitude,applicant,fooditems'
		);

		$query = http_build_query($queryData);
		
		$truckData = $curlWrapper->call(SF_GOV_API . '?' . $query);		
		return $truckData;
	}

}