<?php
function getDb(): PDO {
    return new PDO(
        'mysql:host=localhost;dbname=u82298;charset=utf8',
        'u82298',
        '8867620',
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
        ]
    );
}
