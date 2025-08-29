<?php include_once("./componentes/header.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Título Aquí</title>
    <link rel="stylesheet" href="ruta/a/estilos.css">
    <style>
        body {
            background-color: #061222;
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            animation: animatedBackground 20s ease-in-out infinite;
            background-image: url(./img/4fxxbm4opjd31.jpg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }

        @keyframes animatedBackground {
            0% {
                background-position: 0%;
            }
            100% {
                background-position: 100%;
            }
        }

        header {
            background-color: black;
            width: 100%;
            text-align: center;
            padding: 15px;
            box-sizing: border-box;
        }

        header h1 {
            color: greenyellow;
            font-size: 50px;
            margin-top: 50px;
            margin-bottom: 10px;
            text-align: center;
        }

        nav {
            background-color: #37b0e7;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
        }

        nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
        }

        nav ul li {
            margin: 0 15px;
        }

        nav ul li a {
            text-decoration: none;
            color: white;
            font-size: 20px;
            font-weight: bold;
        }

        h2 {
            text-align: center;
        }

        p {
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            font-size: 30px;
            color: rgb(246, 248, 248);
            text-shadow: 30px 13px 37px #000;
            text-align: center;
        }

        #p1 {
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            font-size: 15px;
            color: rgb(255, 255, 255);
            text-shadow: 30px 13px 37px #000;
            text-align: center;
        }

        strong {
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            font-size: 15px;
            text-align: center;
        }

        a {
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            color: rgb(188, 234, 251);
            padding: 30px;
            text-decoration: none;
            margin: auto;
            font-size: 30px;
            margin-top: 50px;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 30px 13px 37px #000;
        }

        #sec1 {
            text-align: center;
            border-radius: 20px;
            box-shadow: 5px 8px 12px #000;
        }

        .glass {
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.1),
                rgba(255, 255, 255, 0)
            );
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        #sec1 h2 {
            color: #d6f4fc;
            font-size: 40px;
            text-align: center;
            padding: 30px;
            margin: 150px;
            margin-top: 10px;
            margin-bottom: 10px;
            border-radius: 20px;
            background-color: #020731;
            box-shadow: 5px 8px 12px #000;
        }

        #sec1 p {
            text-align: center;
            margin: 200px;
            margin-top: 30px;
            margin-bottom: 30px;
            border-radius: 20px;
            background-color: rgba(255, 255, 255, 0.055);
            box-shadow: 5px 8px 12px #000;
        }

        #sec1 figcaption {
            margin-top: 30px;
            border-radius: 10px;
            box-shadow: 5px 8px 12px #000;
        }

        #sec1 ul li {
            text-align: center;
            display: inline-block;
            text-decoration: none;
        }

        #sec3 {
            text-align: center;
            border-radius: 20px;
            box-shadow: 5px 8px 12px #000;
        }

        #sec3 h1 img {
            border-image: 5px 8px 12px #000;
        }

        #sec3 h2 {
            font-size: 40px;
            text-align: center;
            padding: 30px;
            margin: 150px;
            margin-top: 10px;
            margin-bottom: 10px;
            border-radius: 20px;
            background-color: #020731;
            box-shadow: 5px 8px 12px #000;
        }

        #sec3 p {
            text-align: center;
            margin: 200px;
            margin-top: 30px;
            margin-bottom: 30px;
            border-radius: 20px;
            background-color: rgba(255, 255, 255, 0.055);
            box-shadow: 5px 8px 12px #000;
        }

        iframe {
            box-shadow: 5px 8px 12px #000;
            text-align: center;
            margin-bottom: 30px;
        }

        .fscolor {
            color: #d6f4fc;
        }

        caption {
            font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
            color: rgb(222, 255, 255);
            font-size: 35px;
            margin-top: 50px;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 30px 13px 37px #000;
        }

        table {
            color: white;
            background: #24303c;
            padding: 20px;
            margin: auto;
            margin-bottom: 20px;
            border-radius: 30px;
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            box-shadow: 30px 13px 37px #000;
        }

        table,
        th,
        td {
            border: 1px solid #8c8b8b;
            border-radius: 10px;
        }

        th,
        td {
            padding: 10px;
            text-align: left;
        }

        th {
            background-color: #7bc4ff;
        }

        form {
            width: 350px;
            background: #24303c;
            padding: 15px;
            margin: auto;
            margin-top: 30px;
            margin-bottom: 5px;
            border-radius: 30px;
            font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
            color: white;
            box-shadow: 30px 13px 37px #000;
        }

        form fieldset {
            text-align: center;
            border: none;
        }

        legend {
            color: deepskyblue;
            font-size: 30px;
            margin-top: 20px;
            margin-bottom: 10px;
            text-align: center;
        }

        label {
            display: block;
            margin-bottom: 8px;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 5px;
            margin-bottom: 15px;
            box-sizing: border-box;
            border-radius: 10px;
        }

        input[type="submit"] {
            background-color: deepskyblue;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin-top: 10px;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 4px #999;
        }

        input[type="submit"]:hover {
            background-color: #1e90ff;
        }

        input[type="submit"]:active {
            background-color: #1e90ff;
            box-shadow: 0 2px #666;
            transform: translateY(2px);
        }

    </style>
</head>
<body>
<?php
require_once("conect/conect.php");

if ($con) {
    print "<h2 style='color: white; font-size: 20px; text-align: center; padding: 10px 50px; margin: 50px auto; margin-top: 20px; margin-bottom: 10px; border-radius: 20px; background-color: #37b0e7; box-shadow: 5px 8px 12px #000; width: 80%;'>PrimeFilm, tu destino para todos los productos relacionados con tus películas favoritas! Aquí encontrarás una amplia selección de artículos que celebran el mundo del cine, desde merchandising exclusivo hasta objetos de colección únicos. Explora nuestro catálogo y sumergíte en el universo cinematográfico con PrimeFilm. ¡Todos los productos de tus películas favoritas te esperan!</h2>";
}
?>

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 20px; margin-top: 50px;">
    <div style="width: 400px;">
        <form action="registros/alta.php" method="post" id="formRegistro">
            <fieldset>
                <legend>Registrate</legend>
                <div>
                    <label for="usuario1">Usuario</label>
                    <input id="usuario1" name="usuario1" type="email" class="form-input" />
                </div>
                <div>
                    <label for="pass1">Contraseña</label>
                    <input id="pass1" name="pass1" type="password" class="form-input" />
                </div>
                <div>
                    <label for="pass2">Repetir Contraseña</label>
                    <input id="pass2" name="pass2" type="password" class="form-input" />
                    <div id="passMatchError" style="color: red; font-size: 14px; font-style: italic;"></div>
                </div>
                <div>
                    <label for="nom">Nombre</label>
                    <input id="nom" name="nom" type="text" class="form-input" />
                    <div id="nomError" style="color: red; font-size: 14px; font-style: italic;"></div>
                </div>
                <div>
                    <label for="ape">Apellido</label>
                    <input id="ape" name="ape" type="text" class="form-input" />
                    <div id="apeError" style="color: red; font-size: 14px; font-style: italic;"></div>
                </div>
                <input type="submit" value="Registrarse" class="form-btn">
            </fieldset>
        </form>

        <?php if (isset($_GET['alta'])) {
            print "<div style='text-align: center; font-size: 30px; font-style: italic; color: greenyellow;'><strong>¡Ya te puedes loguear!</strong></div>";
        } ?>

        <?php if (isset($_GET['ban'])) {
            print "<div style='text-align: center; font-size: 30px; font-style: italic; color: red;'><strong>¡Estás banneado! Contacta al Administrador.</strong></div>";
        } ?>
    </div>

    <div style="width: 400px;">
        <form action="registros/login.php" method="post">
            <fieldset>
                <legend>Iniciar sesión</legend>
                <div>
                    <label for="usuario">Usuario</label>
                    <input id="usuario" name="usuario" type="email" placeholder="example@example.com" class="form-input" />
                </div>
                <div>
                    <label for="pass">Contraseña</label>
                    <input id="pass" name="pass" type="password" class="form-input" />
                </div>
                <input type="submit" value="Ingresar" class="form-btn">
            </fieldset>
        </form>

        <?php if (isset($_GET['error'])) {
            print "<div style='text-align: center; font-size: 30px; font-style: italic; color: crimson;'><strong>Usuario o contraseña incorrectos.</strong></div>";
        } ?>
    </div>
</div>

<script>
    document.getElementById('formRegistro').onsubmit = function () {
        var pass1 = document.getElementById('pass1').value;
        var pass2 = document.getElementById('pass2').value;
        var nom = document.getElementById('nom').value;
        var ape = document.getElementById('ape').value;
        var passError = "";
        var nameError = "";

        // Validación para campos vacios

        if (pass1 === "" || pass2 === "") {
            passError += "¡Por favor, completa ambos campos de contraseña!\n";
        }

        if (nom === "") {
            nameError += "¡Por favor, ingresa tu nombre!\n";
        }

        if (ape === "") {
            nameError += "¡Por favor, ingresa tu apellido!\n";
        }

        // Validación de la contraseña
        if (pass1 !== pass2) {
            passError += "¡Las contraseñas no coinciden!\n";
        }

        if (pass1.length < 4) {
            passError += "¡La contraseña debe tener al menos 4 caracteres!\n";
        }

        if (pass1.length > 12) {
            passError += "¡La contraseña no debe superar los 12 caracteres!\n";
        }

        var passPattern = /^[a-zA-Z0-9]+$/;
        if (!passPattern.test(pass1)) {
            passError += "¡La contraseña solo puede contener letras y números!\n";
        }

        // Validación del nombre y apellido
        var namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!namePattern.test(nom)) {
            nameError += "¡El nombre no puede contener números ni caracteres especiales!\n";
        }

        if (!namePattern.test(ape)) {
            nameError += "¡El apellido no puede contener números ni caracteres especiales!\n";
        }

        // Mostrar errores del nombre y apellido
        if (nameError) {
            document.getElementById('nomError').innerHTML = nameError;
            document.getElementById('apeError').innerHTML = ""; // Limpia el error de apellido
            return false;
        } else if (nameError === "" && !namePattern.test(ape)) {
            document.getElementById('nomError').innerHTML = "";
            document.getElementById('apeError').innerHTML = "¡El apellido no puede contener números ni caracteres especiales!\n";
            return false;
        } else {
            document.getElementById('nomError').innerHTML = ""; // Limpia el error de nombre
            document.getElementById('apeError').innerHTML = ""; // Limpia el error de apellido
        }

        // Mostrar error de la contraseña
        if (passError) {
            document.getElementById('passMatchError').innerHTML = passError;
            return false;
        } else {
            document.getElementById('passMatchError').innerHTML = ""; // Limpia el error de contraseña
            return true;
        }
    };
</script>

<?php require_once("./componentes/footer.php");?>
<!-- Code injected by live-server -->
<script>
	// <![CDATA[  <-- For SVG support
	if ('WebSocket' in window) {
		(function () {
			function refreshCSS() {
				var sheets = [].slice.call(document.getElementsByTagName("link"));
				var head = document.getElementsByTagName("head")[0];
				for (var i = 0; i < sheets.length; ++i) {
					var elem = sheets[i];
					var parent = elem.parentElement || head;
					parent.removeChild(elem);
					var rel = elem.rel;
					if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
						var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
						elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
					}
					parent.appendChild(elem);
				}
			}
			var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			var address = protocol + window.location.host + window.location.pathname + '/ws';
			var socket = new WebSocket(address);
			socket.onmessage = function (msg) {
				if (msg.data == 'reload') window.location.reload();
				else if (msg.data == 'refreshcss') refreshCSS();
			};
			if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
				console.log('Live reload enabled.');
				sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
			}
		})();
	}
	else {
		console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
	}
	// ]]>
</script>
</body>
</html>