<?php

$lat = $_POST['lat'];
$long = $_POST['long'];

echo json_encode(array('lat' => $lat, 'long' => $long));