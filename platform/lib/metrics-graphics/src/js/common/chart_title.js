function mg_remove_element (svg, elem) {
    svg.select(elem).remove();
}

function mg_add_chart_title_element (svg, args) {
    
}

function chart_title(args) {
    'use strict';

    var svg = mg_get_svg_child_of(args.target);

    //remove the current title if it exists
    //svg.select('.mg-header').remove();
    mg_remove_element(svg, '.mg-header');
    if (args.target && args.title) {
        var chartTitle = svg.insert('text')
            .attr('class', 'mg-header')
            .attr('x', (args.width + args.left - args.right) / 2)
            .attr('y', args.title_y_position)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.55em');

        //show the title
        chartTitle.append('tspan')
            .attr('class', 'mg-chart-title')
            .text(args.title);

        //show and activate the description icon if we have a description
        if (args.show_tooltips && args.description) {
            chartTitle.append('tspan')
                .attr('class', 'mg-chart-description')
                .attr('dx', '0.3em')
                .text('\uf059');

            //now that the title is an svg text element, we'll have to trigger
            //mouseenter, mouseleave events manually for the popover to work properly
            var $chartTitle = $(chartTitle.node());
            $chartTitle.popover({
                html: true,
                animation: false,
                placement: 'top',
                content: args.description,
                container: args.target,
                trigger: 'manual',
                template: '<div class="popover mg-popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
            }).on('mouseenter', function() {
                d3.selectAll(args.target)
                    .selectAll('.mg-popover')
                    .remove();

                $(this).popover('show');
                $(args.target).select('.popover')
                    .on('mouseleave', function () {
                        $chartTitle.popover('hide');
                    });
            }).on('mouseleave', function () {
                setTimeout(function () {
                    if (!$('.popover:hover').length) {
                        $chartTitle.popover('hide');
                    }
                }, 120);
            });
        }
    }

    if (args.error) {
        error(args);
    }
}

MG.chart_title = chart_title;
