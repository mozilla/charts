/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

var pastWeek = {"gt": {"build.date": Date.today().subtract(Duration.MONTH).unix()}};

Dimension.addEdges(false, Mozilla, [{
	"name": "Builds", "index": "jobs", "edges": [
		{
			"name": "Branch",
			"field": "build.branch",
			"partitions": [
				{"name": "Try", "value": "try", "ordering": 0, "esfilter": {"term": {"build.branch": "try"}}},
				{"name": "Inbound", "value": "mozilla-inbound", "ordering": 0, "esfilter": {"term": {"build.branch": "mozilla-inbound"}}},
				{"name": "Central", "value": "mozilla-central", "ordering": 0, "esfilter": {"term": {"build.branch": "mozilla-central"}}},
				{"name": "Autoland", "value": "autoland", "ordering": 0, "esfilter": {"term": {"build.branch": "autoland"}}}
			]
		},
		{
			"name": "Type",
			"field": "build.type",
			"partitions": [
				{"name": "Standard", "ordering": 0, "esfilter": {"missing": "build.type"}},
				{"name": "PGO", "ordering": 1, "style": {"color": "#f9cb9c"}, "value": "pgo", "esfilter": {"term": {"build.type": "pgo"}}},
				{"name": "OPT", "ordering": 2, "style": {"color": "#f9cb9c"}, "value": "opt", "esfilter": {"term": {"build.type": "opt"}}},
				{"name": "Debug", "ordering": 3, "style": {"color": "#f6b26b"}, "value": "debug", "esfilter": {"term": {"build.type": "debug"}}}
			]
		},
		{
			"name": "Platform",
			"field": "build.platform",
			"partitions": [
				{"name": "Linux32", "style": {"color": "#de4815"}, "value": "linux32", "esfilter": {"term": {"build.platform": "linux32"}}},
				{"name": "Linux64", "style": {"color": "#de4815"}, "value": "linux64", "esfilter": {"term": {"build.platform": "linux64"}}},
				{"name": "OSX64", "style": {"color": "#a4c739"}, "value": "macosx64", "esfilter": {"term": {"build.platform": "macosx64"}}},
				{"name": "Windows32", "style": {"color": "#136bab"}, "value": "win32", "esfilter": {"term": {"build.platform": "win32"}}},
				{"name": "Windows64", "style": {"color": "#136bab"}, "value": "win64", "esfilter": {"term": {"build.platform": "win64"}}}
			],
			"esfilter": {"not": {"contains": {"run.key": "br-haz"}}}
		},
		{"name": "Product", "field": "build.product",
			"partitions": [
				{"name": "Firefox", "style": {"color": "#de4815"}, "value": "firefox", "esfilter": {"term": {"build.product": "firefox"}}}
			]
		},
		{
			"name": "Test",
			"field": "run.suite",
			"partitions": [
				{"name": "androidx86-set", "value": "androidx86-set", "esfilter": {"term": {"run.suite": "androidx86-set"}}},
				{"name": "chromez", "value": "chromez", "esfilter": {"term": {"run.suite": "chromez"}}},
				{"name": "chromez-osx", "value": "chromez-osx", "esfilter": {"term": {"run.suite": "chromez-osx"}}},
				{"name": "cpp_gtest", "value": "cpp_gtest", "esfilter": {"term": {"run.suite": "cpp_gtest"}}},
				{"name": "cppunit", "value": "cppunit", "esfilter": {"term": {"run.suite": "cppunit"}}},
				{"name": "crashtest", "value": "crashtest", "esfilter": {"term": {"run.suite": "crashtest"}}},
				{"name": "dromaeojs", "value": "dromaeojs", "esfilter": {"term": {"run.suite": "dromaeojs"}}},
				{"name": "g1", "value": "g1", "esfilter": {"term": {"run.suite": "g1"}}},
				{"name": "g2", "value": "g2", "esfilter": {"term": {"run.suite": "g2"}}},
				{"name": "g2-osx", "value": "g2-osx", "esfilter": {"term": {"run.suite": "g2-osx"}}},
				{"name": "g3", "value": "g3", "esfilter": {"term": {"run.suite": "g3"}}},
				{"name": "g4", "value": "g4", "esfilter": {"term": {"run.suite": "g4"}}},
				{"name": "gaia-build-unit", "value": "gaia-build-unit", "esfilter": {"term": {"run.suite": "gaia-build-unit"}}},
				{"name": "gaia-integration", "value": "gaia-integration", "esfilter": {"term": {"run.suite": "gaia-integration"}}},
				{"name": "gaia-js-integration", "value": "gaia-js-integration", "esfilter": {"term": {"run.suite": "gaia-js-integration"}}},
				{"name": "gaia-linter", "value": "gaia-linter", "esfilter": {"term": {"run.suite": "gaia-linter"}}},
				{"name": "gaia-unit", "value": "gaia-unit", "esfilter": {"term": {"run.suite": "gaia-unit"}}},
				{"name": "gtest", "value": "gtest", "esfilter": {"term": {"run.suite": "gtest"}}},
				{"name": "jittest", "value": "jittest", "esfilter": {"term": {"run.suite": "jittest"}}},
				{"name": "jsreftest", "value": "jsreftest", "esfilter": {"term": {"run.suite": "jsreftest"}}},
				{"name": "luciddream", "value": "luciddream", "esfilter": {"term": {"run.suite": "luciddream"}}},
				{"name": "marionette", "value": "marionette", "esfilter": {"term": {"run.suite": "marionette"}}},
				{"name": "marionette-webapi", "value": "marionette-webapi", "esfilter": {"term": {"run.suite": "marionette-webapi"}}},
				{"name": "media-tests", "value": "media-tests", "esfilter": {"term": {"run.suite": "media-tests"}}},
				{"name": "media-youtube-tests", "value": "media-youtube-tests", "esfilter": {"term": {"run.suite": "media-youtube-tests"}}},
				{"name": "mochitest", "value": "mochitest", "esfilter": {"term": {"run.suite": "mochitest"}}},
				{"name": "mochitest-a11y", "value": "mochitest-a11y", "esfilter": {"term": {"run.suite": "mochitest-a11y"}}},
				{"name": "mochitest-browser-chrome", "value": "mochitest-browser-chrome", "esfilter": {"term": {"run.suite": "mochitest-browser-chrome"}}},
				{"name": "mochitest-browser-screenshots", "value": "mochitest-browser-screenshots", "esfilter": {"term": {"run.suite": "mochitest-browser-screenshots"}}},
				{"name": "mochitest-chrome", "value": "mochitest-chrome", "esfilter": {"term": {"run.suite": "mochitest-chrome"}}},
				{"name": "mochitest-clipboard", "value": "mochitest-clipboard", "esfilter": {"term": {"run.suite": "mochitest-clipboard"}}},
				{"name": "mochitest-debug", "value": "mochitest-debug", "esfilter": {"term": {"run.suite": "mochitest-debug"}}},
				{"name": "mochitest-devtools-chrome", "value": "mochitest-devtools-chrome", "esfilter": {"term": {"run.suite": "mochitest-devtools-chrome"}}},
				{"name": "mochitest-gl", "value": "mochitest-gl", "esfilter": {"term": {"run.suite": "mochitest-gl"}}},
				{"name": "mochitest-gpu", "value": "mochitest-gpu", "esfilter": {"term": {"run.suite": "mochitest-gpu"}}},
				{"name": "mochitest-jetpack", "value": "mochitest-jetpack", "esfilter": {"term": {"run.suite": "mochitest-jetpack"}}},
				{"name": "mochitest-media", "value": "mochitest-media", "esfilter": {"term": {"run.suite": "mochitest-media"}}},
				{"name": "mochitest-oop", "value": "mochitest-oop", "esfilter": {"term": {"run.suite": "mochitest-oop"}}},
				{"name": "mochitest-other", "value": "mochitest-other", "esfilter": {"term": {"run.suite": "mochitest-other"}}},
				{"name": "mochitest-push", "value": "mochitest-push", "esfilter": {"term": {"run.suite": "mochitest-push"}}},
				{"name": "mozbase", "value": "mozbase", "esfilter": {"term": {"run.suite": "mozbase"}}},
				{"name": "mozmill", "value": "mozmill", "esfilter": {"term": {"run.suite": "mozmill"}}},
				{"name": "other", "value": "other", "esfilter": {"term": {"run.suite": "other"}}},
				{"name": "other-osx", "value": "other-osx", "esfilter": {"term": {"run.suite": "other-osx"}}},
				{"name": "other_l64", "value": "other_l64", "esfilter": {"term": {"run.suite": "other_l64"}}},
				{"name": "other_nol64", "value": "other_nol64", "esfilter": {"term": {"run.suite": "other_nol64"}}},
				{"name": "plain-reftest", "value": "plain-reftest", "esfilter": {"term": {"run.suite": "plain-reftest"}}},
				{"name": "reftest", "value": "reftest", "esfilter": {"term": {"run.suite": "reftest"}}},
				{"name": "reftest-no-accel", "value": "reftest-no-accel", "esfilter": {"term": {"run.suite": "reftest-no-accel"}}},
				{"name": "reftest-sanity-oop", "value": "reftest-sanity-oop", "esfilter": {"term": {"run.suite": "reftest-sanity-oop"}}},
				{"name": "remote-tp4m_nochrome", "value": "remote-tp4m_nochrome", "esfilter": {"term": {"run.suite": "remote-tp4m_nochrome"}}},
				{"name": "remote-trobocheck2", "value": "remote-trobocheck2", "esfilter": {"term": {"run.suite": "remote-trobocheck2"}}},
				{"name": "remote-tsvgx", "value": "remote-tsvgx", "esfilter": {"term": {"run.suite": "remote-tsvgx"}}},
				{"name": "robocop", "value": "robocop", "esfilter": {"term": {"run.suite": "robocop"}}},
				{"name": "svgr", "value": "svgr", "esfilter": {"term": {"run.suite": "svgr"}}},
				{"name": "svgr-osx", "value": "svgr-osx", "esfilter": {"term": {"run.suite": "svgr-osx"}}},
				{"name": "tp5o", "value": "tp5o", "esfilter": {"term": {"run.suite": "tp5o"}}},
				{"name": "tp5o-osx", "value": "tp5o-osx", "esfilter": {"term": {"run.suite": "tp5o-osx"}}},
				{"name": "web-platform-tests", "value": "web-platform-tests", "esfilter": {"term": {"run.suite": "web-platform-tests"}}},
				{"name": "web-platform-tests-reftests", "value": "web-platform-tests-reftests", "esfilter": {"term": {"run.suite": "web-platform-tests-reftests"}}},
				{"name": "webapprt-chrome", "value": "webapprt-chrome", "esfilter": {"term": {"run.suite": "webapprt-chrome"}}},
				{"name": "xpcshell", "value": "xpcshell", "esfilter": {"term": {"run.suite": "xpcshell"}}},
				{"name": "xperf", "value": "xperf", "esfilter": {"term": {"run.suite": "xperf"}}}
			],
			"esfilter": {"not": {"contains": {"run.key": "br-haz"}}}
		},

	]
}]);


