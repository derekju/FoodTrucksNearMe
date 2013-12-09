<?php

namespace FoodTrucksNearMe;

require_once(__DIR__ . '/config/config.php');

?>

<!DOCTYPE html>
<html
<head>
	<title>Food Truck Explorer</title>

	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />

	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	<link rel="stylesheet" href="static/css/style.css">
</head>
<body>
	<div class="application">
		<div class="header">
			<div class="header-title"><?= Strings::getStringByName('title') ?></div>
			<div class="header-subtitle"><?= Strings::getStringByName('subtitle') ?></div>
			<div class="cb"></div>
		</div>
		<div class="contents">
			<div class="nav-bar">
				<div class="enter-location"></div>
				<div class="location-text">
					<input type="text" class="form-control form-override" id="address_input" placeholder="<?= Strings::getStringByName('enter_location') ?>">
					<button type="button" class="btn btn-default" id="address_submit">Search</button>
				</div>
				<div class="loading-area-and-results"></div>
				<div class="cb"></div>
			</div>
			<div id="map-canvas"></div>
			<div class="results-table"></div>
		</div>
	</div>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>	
	<script src="static/js/underscore-min.js"></script>
 	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=<?= GMAPS_API_KEY ?>&sensor=false"></script>
	<script src="static/js/application.js"></script>
	<script type="text/javascript">
	$(function() {
		if (typeof FT != 'undefined') {
			FT.Configuration.STRINGS = <?= json_encode(Strings::getAllStrings()) ?>;
		}
	});
	</script>
</body>
</html>