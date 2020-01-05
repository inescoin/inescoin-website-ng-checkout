<?php

$helpMessage = PHP_EOL . 'Usage: php prepare.php' . PHP_EOL . PHP_EOL;


// Utils
function cmd($cmd)
{
  echo($cmd . PHP_EOL);
  shell_exec($cmd);
}


// Build de la version de dev en mode production
cmd('./node_modules/.bin/ng build --prod');


// Recupération de la page HTML
$indexPagePath = './dist/inescoin-checkout/index.html';
file_exists($indexPagePath) ? $indexPage = file_get_contents($indexPagePath) : die();

// Extractions des tags <script>
$regexScripts = "/\<script\\b[^>]*>.*?<\\/script>/i";
preg_match_all($regexScripts, $indexPage, $scripts);

// Extractions du tag css <link>
$regexLink = "/\<link rel=\"stylesheet\".*?\>/i";
preg_match_all($regexLink, $indexPage, $links);

// Formattages
$_scripts = array_map(function($script) {
	return str_replace(['<script src="'], ['<script src="/assets/ng/'], $script) . PHP_EOL;
}, $scripts[0]);

$_links = '  ' . str_replace(['<link rel="stylesheet" href="'], ['<link rel="stylesheet" type="text/css" href="/assets/ng/'], $links[0][0]) . PHP_EOL;

// Template du nouveau rendu
$template = $_links . PHP_EOL . '
<nav class="navbar navbar-expand-lg navbar-light py-3">
  <div class="container">
    <a class="navbar-brand" href="#page-top"><?php echo $domain[\'company\'][\'name\']; ?></a>
    <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  </div>
</nav>

<section class="page-section">
	<inescoin-checkout walletAddress="0x9c7983ae76A0371fFce50Df3383eF53Dea0647b8"></inescoin-checkout>
</section>

' . PHP_EOL . implode($_scripts);

// // Mise à jour du fichier avec le nouveau rendu
$path = '../inescoin-website-viewer/src/template/store-checkout.tpl.php';
file_put_contents($path, $template);
var_dump('Pushed to -> ' . $template, $template);

cmd('rm -rf ../inescoin-website-viewer/public/assets/ng/*');

cmd("cp dist/inescoin-checkout/* ../inescoin-website-viewer/public/assets/ng/");


echo PHP_EOL . 'FINISH !' . PHP_EOL;
