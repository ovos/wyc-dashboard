const gulp = require('gulp');
const path = require('path'); // file path manipulation https://nodejs.org/api/path.html
const fs = require('fs');
const merge = require('merge-stream');

const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const debug = require('gulp-debug');
const util = require('gulp-util');
const gulpif = require('gulp-if');

const less = require('gulp-less');
const lessReporter = require('gulp-less-reporter');
const lessParseImports = require('parse-less-import');
// less plugins
const LessPluginAutoprefix = require('less-plugin-autoprefix');
const lessAutoprefixer = new LessPluginAutoprefix({cascade: false});

const themesDir = './public/themes';
const lessSrc = 'less/styles.less';

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('./webpack.config.js');

const browserSync = require('browser-sync').create();

// debug mode
const debugMode = false;

function getThemesWithLess(themesDir, lessSrc) {
	return fs.readdirSync(themesDir).filter(function (file) {
		let lessPath = path.join(themesDir, file, lessSrc);
		return fs.existsSync(lessPath) && fs.statSync(lessPath).isFile();
	});
}

// this is global and less task reads this to know which themes should recompile. sooo dirty.
var themes = getThemesWithLess(themesDir, lessSrc);

function compileLess(src, cssRoot, theme) {
	cssRoot = cssRoot || '.';

	if (debugMode) util.log(util.colors.cyan('Compiling \'' + theme + '\' + : ' + path.join(cssRoot, src)));
	if (browserSync.active) {
		browserSync.notify('starting LESS...');
	}

	return gulp.src(src, {
		//base: './' // set base to the folder of processed file (in case we'd like to save css in the same folder, remove function in gulp.dest)
		cwd: cssRoot,
		base: cssRoot // no idea why it works, but it has to be like that
	})
	// there is an issue with handling errors in gulp-less
	// the plumber should fix "Error: no writecb in Transform class" at node_modules\gulp-less\index.js:58:14
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(less({
				plugins: [lessAutoprefixer]
			})
			// workaround for: a watcher stops watching files after an error
				.on('error', function (err) {
					lessReporter(err);
					this.emit('end');
				})
		)
		.pipe(sourcemaps.mapSources(function (sourcePath, file) {
			// https://github.com/less/less-plugin-autoprefix/issues/25
			// https://github.com/sindresorhus/gulp-autoprefixer/issues/10
			// at least keep this shit sane so that it does not increment n in <input css n> on every recompile while watcher is running
			// until they fix the issue with autoprefixer + less
			if (sourcePath.match(/<input css/)) {
				sourcePath = '<input css 1>';
			}
			return sourcePath;
		}))
		.pipe(sourcemaps.write('./', {
			includeContent: false // do not copy css/less into mapfile, as we host source files
		}))
		.pipe(gulp.dest(function (file) {
			const parent = path.dirname(path.dirname(file.path)); // double dirname to read parent folder
			file.path = parent + path.sep + path.basename(file.path); // rewrite path to save output in parent folder

			return cssRoot; // return folder to save in (could be '.' if base has been set to './' in src)
		}))
		.pipe(gulpif(debugMode, debug({minimal: false})))
		.on('finish', function () {
			if (browserSync.active) {
				browserSync.notify('LESS done, reloading css...', 750);
				browserSync.reload('*.css');  // reload css
			}
			if (debugMode) util.log(util.colors.cyan('Finished compiling: ' + path.join(cssRoot, src)));
		});
}

function readLessImports(file, checked = []) {
	if (!fs.existsSync(file)) {
		return [];
	}

	let contents = fs.readFileSync(file, 'utf8');
	let imports = lessParseImports(contents);
	let dirname = path.dirname(file);

	imports = imports.map(item => {
		let extname = path.extname(item.path);
		if (!extname || ['.less', '.css'].indexOf(extname) === -1) {
			item.path += '.less';
		}
		return path.resolve(path.join(dirname, item.path)); // return absolute path
	});

	for (let lessFile of imports) {
		if (checked.includes(lessFile)) {
			continue;
		}
		imports = imports.concat(readLessImports(lessFile, checked));
	}

	return imports;
}

gulp.task('less', function () {
	// compile "lessSrc" in all themes
	let tasks = themes.map(function (theme) {
		return compileLess(lessSrc, path.join(themesDir, theme), theme);
	});

	return merge(tasks);
});

gulp.task('less:watch', function (done) {
	function startTask(theme) {
		// this is ugly. but i wanted 'starting / finished after xx s' messages to be displayed in cli as an indicator that something is happening
		themes = [theme]; // modifying var out of the scope... run task on one folder only

		util.log('less-watch: starting \'' + util.colors.cyan('less') + '\' for theme ' + util.colors.magenta(themes) + '...');

		gulp.task('less')();
	}

	let watcher = gulp.watch(themesDir + '/**/*.less', {
		delay: 350,
		ignoreInitial: true,
		usePolling: true // needs to be enabled, otherwise this happens (OMG): https://github.com/paulmillr/chokidar/issues/296
	});

	watcher.on('all', function (event, eventPath, stats) {
		let relPathLess = relPath = path.relative(themesDir, eventPath), // path to less file, relative to themes dir
			firstSepIndex = relPath.indexOf(path.sep),
			theme = null;
		if (firstSepIndex > -1) {
			theme = relPath.substring(0, firstSepIndex); // take first folder from relative path - possibly a theme name
			relPathLess = relPath.substring(firstSepIndex + 1);
		}

		util.log('less-watch: ' + event + ' ' + util.colors.magenta(eventPath));

		if (relPathLess === path.normalize(lessSrc)) {
			return startTask(theme);
		}

		let imports = readLessImports(path.join(themesDir, theme, lessSrc)); // read imports from main less file

		if (imports.includes(path.resolve(eventPath))) {
			return startTask(theme);
		}
	});

	util.log('Note: ignore the "Finished less:watch" notification. The watcher will still be running...');
	done();
});

function runWebpack(callback, config) {
	if (browserSync.active) {
		browserSync.notify('starting webpack...');
	}

	config = webpackMerge({
		mode: 'production',
		plugins: [
			new webpack.ProgressPlugin({
				//profile: true
			})
		]
	}, config, webpackConfig());

	webpack(config, function (err, stats) {
		if (err) {
			throw new gutil.PluginError('webpack', err);
		}

		util.log('[' + util.colors.cyan('webpack') + '] Completed\n' + stats.toString({
			assets: true,
			chunks: false,
			chunkModules: false,
			colors: true,

			hash: false,
			timings: false,
			version: false
		}));

		if (!config.watch) {
			callback(); // don't call callback because webpack is watching files
		}

		if (browserSync.active) {
			browserSync.notify('webpack done, reloading page...');
			browserSync.reload(); // reload page
		}
	});
}

gulp.task('webpack', function (cb) {
	runWebpack(cb, {});
});

gulp.task('webpack:watch', function (cb) {
	runWebpack(cb, {watch: true});
});

function initBrowserSync(cb) {
	browserSync.init({
		proxy: 'localhost/ovos/wyc-dashboard/public/',
		port: 80 // localhost port
	}, cb);
}

initBrowserSync.displayName = "brower-sync";
initBrowserSync.description = "initializes brower-sync";

//gulp.task('default', gulp.parallel('less', 'less:watch'));
gulp.task('default-plus-webpack', gulp.series(initBrowserSync, gulp.parallel('less', 'less:watch', 'webpack:watch')));
gulp.task('default', gulp.series(initBrowserSync, gulp.parallel('less', 'less:watch')));