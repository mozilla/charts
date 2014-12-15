charts
======
Static pages for [charts.mozilla.org](http://charts.mozilla.org/) The summary
of the this project is found on [the Mozilla wiki](https://wiki.mozilla.org/Auto-tools/Projects/Charts#Overview_of_charts.mozilla.org)


Prerequisits
------------

You should be able to reach the public cluster.  My people page has [a test page to confirm public cluster is accessible](http://people.mozilla.org/~klahnakoski/modevmetrics/Tutorial01-Minimum.html).


Setup
-----

Simply clone from Github.

    https://github.com/klahnakoski/MoDevMetrics.git

You can then open the files with your browser


Contribution
------------

There are three main branches

  * [master](.) - deployed to production: charts.mozilla.org
  * [allizom](tree/aliizom) - deployed to staging: charts.paas.allizom.org
  * [dev](tree/dev) - active development: **add you pull requests here**

###Submitting a Patch
At a bare minimum:

  * fork this repo
  * craft your changes, and
  * send a pull request

Extra appreciation is granted if you also

  * update the corresponding bugzilla bug with an attchment pointing to the
  pull request

Using Github pull requests for code submission, and Bugzilla for issue
tracking, is clunky:  So stick to the Github if you find this is a nasty
barrier to getting stuff done.  What's most important is you submit code!
I will deal with the administration.

