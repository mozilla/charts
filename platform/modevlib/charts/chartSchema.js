a = {
	"$ref": "#definitions.chart",
	"definitions": {
		"chart": {
			"description": "chart definition",
			"type": "object",
			"properties": {
				"data": {
					"description": "an array of objects",
					"type": "nested"
				},
				"target": {
					"description": "name of dom elements to insert chart",
					"type": "string"
				},
				"axis": {
					"description": "list of axis, property names not limited to 'x' and 'y', ",
					"type": "object",
					"properties": {
						"x": {"$ref": "axis"},
						"y": {"$ref": "axis"}
					}
				},
				"area": {
					"description": "details regarding the plot area",
					"type": "object",
					"properties": {
						"style": {"$ref": "#definitions.style"}
					}
				},
				"title": {
					"description": "details regarding the title.  Can also be a simple string.",
					"type": "object",
					"properties": {
						"position": {
							"description": "location of title relative to area (default=top)",
							"type": "string"
						},
						"label": {
							"description": "actual text of the title",
							"type": "string"
						},
						"description": {
							"description": "detail text shown while hovering over title (default=null)",
							"type": "string"
						}
					}
				},
				"legend": {
					"description": "more configuration for ledgend",
					"type": "object",
					"properties": {
						"label": {
							"description": "name the legend",
							"type": "string"
						},
						"position": {
							"description": "position of legend relative to plot area (top/left/bottom/right)",
							"type": "string"
						},
						"style": {"$ref": "#definitions.style"}
					}
				},
				"series": {
					"description": "what is ploted ",
					"type": "object",
					"properties": {
						"value": {
							"description": "expression to extract from data and chart, use tuple if plotting more than one dimension",
							"type": "string"
						},
						"axis": {
							"description": "name of the axis to apply against: can be any #chart.axis property name.  Use tuple if plotting more than one dimension.",
							"type": "string"
						},
						"type": {
							"description": "the chart type to show as (bar/line/dot)",
							"type": "string"
						},
						"label": {
							"description": "name of the series",
							"type": "string"
						},
						"marker": {
							"size": {
								"description": "size of the datapoint",
								"type": "number"
							},
							"symbol": {
								"description": "shape of datapoint",
								"type": "string"
							},
							"style": {"$ref": "#definitions.style"}
						},
						"hoverStyle": {
							"size": {
								"description": "size while hovering",
								"type": "number"
							},
							"symbol": {
								"description": "shape while hovering",
								"type": "string"
							},
							"style": {"$ref": "#definitions.style"}
						}
					}
				}
			}
		},
		"axis": {
			"position": {
				"description": "where to place the axis, relative to plot area (top/right/bottom/left)",
				"type": "string"
			},
			"rug": {
				"description": "show projection as a series of ticks along the axis",
				"type": "boolean",
				"default": false
			},
			"label": {
				"description": "name of axis",
				"type": "string"
			},
			"value": {
				"description": "expression to evaluate, or name of the property",
				"type": "string"
			},
			"unit": {
				"description": "the measurement unit, using multiply (`*`) and divide (`/`) operators",
				"type": "string"
			},
			"format": {
				"description": "format of the reference values on the axis",
				"type": "string"
			},
			"normalized": {
				"description": "Convert to % of total",
				"type": "boolean",
				"default": true
			},
			"range": {
				"description": "define the range of values on axis",
				"type": "object",
				"properties": {
					"min": {
						"description": "minimum axis value shown",
						"type": "number"
					},
					"max": {
						"description": "maximum axis value shown",
						"type": "number"
					}
				}
			},
			"ticks": {
				"description": "describe the axis ticks",
				"type": "object",
				"properties": {
					"interval": {
						"description": "distance between ticks, or ...",
						"type": "number"
					},
					"quantity": {
						"description": "total number of ticks to show, not including right-most",
						"type": "number"
					},
					"style": {"$ref": "#definitions.style"}
				}
			},
			"lines": {
				"description": "",
				"type": "nested",
				"properties": {
					"style": {"$ref": "#definitions.style"},
					"label": ""
				}
			},
			"bands": {
				"description": "axis range that should be marked",
				"type": "nested",
				"properties": {
					"label": {
						"description": "name given to this band",
						"type": "string"
					},
					"id": {
						"description": "id for programatic reference",
						"type": "string"
					},
					"min": {
						"description": "minimum value in band",
						"type": "number"
					},
					"max": {
						"description": "maximum value of band",
						"type": "number"
					},
					"style": {"$ref": "#definitions.style"}
				}
			},
			"marks": {
				"description": "axis values that should be marked",
				"type": "nested",
				"properties": {
					"value": {
						"description": "value to mark",
						"type": "number"
					},
					"label": {
						"description": "name shown on chart and given to mark",
						"type": "string"
					},
					"id": {
						"description": "machine-used id for mark",
						"type": "string"
					},
					"style": {"$ref": "#definitions.style"}

				}
			},
			"style": {
				"$ref":"#definitions.style"
			}
		},
		"style": {
			"font": {
				"description": "css font",
				"type": "string"
			},
			"format": {
				"description": "text format string",
				"type": "string"
			},
			"width": {
				"description": "css width",
				"type": "number"
			},
			"color": {
				"description": "css color",
				"type": "string"
			},
			"visibility":{
				"description": "initial visibility (default visible)",
				"type": "string",
				"enum": ["visibile", "hidden"]
			},
			"style": {
				"description": "css solid, dotted, etc",
				"type": "string"
			},
			"z-index": {
				"description": "css z-depth",
				"type": "number"
			},
			"border": {"$ref": "#definitions.style"},
			"line": {"$ref": "#definitions.style"},
			"padding": {
				"description": "css padding",
				"type": "object",
				"properties": {
					"right": {
						"description": "explicit padding for right",
						"type": "string"
					}
				}
			}
		},
		"hover": {
			"description": "what to do when hovering over chart value",
			"type": "object",
			"properties": {
				"format": {
					"description": "formatting rules when hovering over point",
					"type": "object",
					"properties": {
						"x": {
							"description": "formatting the x coordinate value",
							"type": "string"
						}
					}
				}
			}
		}
	}
};
