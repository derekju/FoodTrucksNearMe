<?php

namespace FoodTrucksNearMe;

// Google Maps API key
define('GMAPS_API_KEY', 'AIzaSyDCreyKprRd85q-Y62J0CYP3FBboWzK74Q');
// Path to food truck API
define('SF_GOV_API', 'http://data.sfgov.org/resource/rqzj-sfat.json');

/**
 * Our autoloader function
 */
function Autoloader($class) {
	$class = str_replace(__NAMESPACE__ . '\\', '', $class);
	if (file_exists(__DIR__ . '/../includes/' . $class . '.class.php')) {
    	require_once __DIR__ . '/../includes/' . $class . '.class.php';
    }
}

spl_autoload_register(__NAMESPACE__ . '\\Autoloader');