Running Tests
-------------

This directory has a series of very simple page tests.  They test for crashes
and stalls.  Since the Javascript code has been written with a crash-early
philosphy, this makes the tests reasonably effective at catching problems.

These tests can benefit from a human ensuring the rendered pages are
reasonable.  For example, "did this page nothing significant?", "is it
formatted properly?"  "are descriptions or values showing as 'undefined'?".
This is a class of problems that is difficult to detect with code.  If there
is a specific part of the page that requires manual inspection, then it is a
candidate for automation.  The intent of a human reviewing the test results
is to stay aware of possible problems.  A much greater test suite will remove
the need for this manual inspection, of course.

Installation
------------

    cd charts/tests/
    pip install -r requirements.txt

Running Tests
-------------

    cd charts/
    py.test tests

