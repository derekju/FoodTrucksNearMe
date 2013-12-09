<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/../config/config.php');

class CurlWrapper {

	private $ch;

	public function __construct() {
		$this->ch = curl_init();
		curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, true);
	}

	public function call($endpoint) {
		curl_setopt($this->ch, CURLOPT_URL, $endpoint);
		$result = curl_exec($this->ch);

		return $result;
	}

}