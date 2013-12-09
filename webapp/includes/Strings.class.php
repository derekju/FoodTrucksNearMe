<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/../config/config.php');

class Strings {

	/**
	 * Private declaration of all strings
	 */
	private static $strings = array(
		'undefined' => 'Undefined',
		'title' => 'Food Finder',
		'subtitle' => 'by Uber',
		'enter_location' => 'Enter address to search'
	);

	/**
	 * Returns a string by a particular key
	 */
	public static function getStringByName($name) {
		if (isset(self::$strings[$name])) {
			return self::$strings[$name];
		} else {
			return self::$strings['undefined'];
		}
	}

}