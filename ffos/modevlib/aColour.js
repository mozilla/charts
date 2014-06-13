/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


//http://en.wikipedia.org/wiki/Luminance_%28relative%29  Y = 0.2126 R + 0.7152 G + 0.0722 B

importScript("util/CNV.js");


var colors={
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkgrey: "#a9a9a9",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategray: "#2f4f4f",
	darkslategrey: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	gold: "#ffd700",
	goldenrod: "#daa520",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#adff2f",
	grey: "#808080",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	lavender: "#e6e6fa",
	lavenderblush: "#fff0f5",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrodyellow: "#fafad2",
	lightgray: "#d3d3d3",
	lightgreen: "#90ee90",
	lightgrey: "#d3d3d3",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategray: "#778899",
	lightslategrey: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370db",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#db7093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	slategrey: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};



var Color = function(){
};

Color.showAll=function(divID){
	var template='<div style="float:left;height:20px;width:20px;background-color:{{COLOR}}" title="{{NAME}}"></div>';

	var list=[];
	forAllKey(colors, function(name, color, i){
		list.push({"name":name, "color":Color.newHTML(color).toLUV()});
	});

	list.sort(function(a, b){return a.color.U-b.color.U});
	list.sort(function(a, b){return a.color.V-b.color.V});
	list.sort(function(a, b){return (a.color.L-b.color.L)});


	var html="";
	list.forall(function(c, i){
		html+=template.replaceAll("{{NAME}}",c.name).replaceAll("{{COLOR}}", c.color.toHTML());
	});
	var temp=$("#"+divID);
		temp.html(html);
};//method


//EXPECT COLOUR AS HEX IN FORM #RRGGBB
Color.newHTML=function(html){
	return new ColorRGB(
		CNV.hex2int(html.substring(1,3))/255.0,
		CNV.hex2int(html.substring(3,5))/255.0,
		CNV.hex2int(html.substring(5,7))/255.0
	);
};



var ColorRGB=function(r, g, b){
	this.R=r;
	this.G=g;
	this.B=b;
};


var ColorXYZ=function(x, y, z){
	this.X=x;
	this.Y=y;
	this.Z=z;
};


var ColorLUV=function(L, u, v){
	this.L=L;
	this.U=u;
	this.V=v;
};


var ColorLab=function(L, a, b){
	this.L=L;
	this.a=a;
	this.b=b;
};

var ColorLch=function(L, c, h){
	this.L=L;
	this.c=c;
	this.h=h;
};

var ColorLinear=function(r, g, b){
	this.R=r;
	this.G=g;
	this.B=b;
};




(function(){
	var DEBUG=false;


	ColorRGB.prototype.toHTML=function(){
		return "#"+CNV.int2hex(this.R*255, 2)+CNV.int2hex(this.G*255, 2)+CNV.int2hex(this.B*255, 2);
	};


	ColorRGB.prototype.toLUV=function(){
		return Rgb2Luv(this);
	};

	ColorRGB.prototype.toLch=function(){
		return Rgb2Lch(this);
	};

	ColorRGB.prototype.toLinear=function(){
		return new ColorLinear(INVGAMMACORRECTION(this.R), INVGAMMACORRECTION(this.G), INVGAMMACORRECTION(this.B));
	};

	ColorLinear.prototype.toHTML=function(){
		return this.toRGB().toHTML();
	};

	ColorLinear.prototype.toRGB=function(){
		return new ColorRGB(GAMMACORRECTION(this.R), GAMMACORRECTION(this.G), GAMMACORRECTION(this.B));
	};

	ColorLUV.prototype.toHTML=function(){
		return Luv2Rgb(this).toHTML();
	};

	ColorLUV.prototype.toRGB=function(){
		return Luv2Rgb(this);
	};

	ColorLUV.prototype.hue=function(rads){
		var result=new aMath.Cart(this.U,this.V)
			.toPolar()
			.rotate(rads)
			.toCart()
		;

		return new ColorLUV(this.L, result.x, result.y);
	};

	ColorLch.prototype.hue=function(degrees){
		return new ColorLch(this.L, this.c, this.h+degrees);
	};

	ColorLch.prototype.toHTML=function(){
		return Lch2Rgb(this).toHTML();
	};





//TO KYLE: CIELUV SHOULD BE THE BEST FORMAT FOR HUMANE COLOUR TRANSITIONS
//C CODE FOR COLOR TRANSFORMATIONS FROM
// http://www.mathworks.com/matlabcentral/fileexchange/28790-colorspace-transformations

///**
// * @file colorspace.h
// * @author Pascal Getreuer 2005-2010 <getreuer@gmail.com>
// */
//#ifndef _COLORSPACE_H_
//#define _COLORSPACE_H_
//
///** @brief Datatype to use for representing real numbers
// * Set this typedef to either double or float depending on the application.
// */
//typedef double num;
//
//
/** @brief XYZ color of the D65 white point */
var WHITEPOINT_X=0.950456;
var WHITEPOINT_Y=1.0;
var WHITEPOINT_Z=1.088754;

/**
* @brief sRGB gamma correction, transforms R to R'
* http://en.wikipedia.org/wiki/SRGB
*/
GAMMACORRECTION=function(t){
	return (t <= 0.0031306684425005883) ? (12.92*t) : (1.055*Math.pow(t, 0.416666666666666667) - 0.055);
};//method

/**
* @brief Inverse sRGB gamma correction, transforms R' to R
*/
INVGAMMACORRECTION=function(t){
	return (t <= 0.0404482362771076) ? (t/12.92) : Math.pow((t + 0.055)/1.055, 2.4);
};//method


/**
* @brief CIE L*a*b* f function (used to convert XYZ to L*a*b*)
* http://en.wikipedia.org/wiki/Lab_color_space
*/
var LABF=function(t){
	return ((t >= 8.85645167903563082e-3) ? Math.pow(t,0.333333333333333) : (841.0/108.0)*(t) + (4.0/29.0));
};//method

/**
* @brief CIE L*a*b* inverse f function
* http://en.wikipedia.org/wiki/Lab_color_space
*/
function LABINVF(t){
	return ((t >= 0.206896551724137931) ? ((t)*(t)*(t)) : (108.0/841.0)*((t) - (4.0/29.0)));
}

/** @brief u'v' coordinates of the white point for CIE Lu*v* */
var WHITEPOINT_U=((4*WHITEPOINT_X) /(WHITEPOINT_X + 15*WHITEPOINT_Y + 3*WHITEPOINT_Z));
var WHITEPOINT_V=((9*WHITEPOINT_Y) /(WHITEPOINT_X + 15*WHITEPOINT_Y + 3*WHITEPOINT_Z));

/**
* @brief Transform sRGB to CIE XYZ with the D65 white point
*
* @param X, Y, Z pointers to hold the result
* @param R, G, B the input sRGB values
*
* Poynton, "Frequently Asked Questions About Color," page 10
* Wikipedia: http://en.wikipedia.org/wiki/SRGB
* Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space
*/
function Rgb2Xyz(rgb){
	var R = INVGAMMACORRECTION(rgb.R);
	var G = INVGAMMACORRECTION(rgb.G);
	var B = INVGAMMACORRECTION(rgb.B);
	var X = (0.4123955889674142161*R + 0.3575834307637148171*G + 0.1804926473817015735*B);
	var Y = (0.2125862307855955516*R + 0.7151703037034108499*G + 0.07220049864333622685*B);
	var Z = (0.01929721549174694484*R + 0.1191838645808485318*G + 0.9504971251315797660*B);

	var output=new ColorXYZ(X, Y, Z);

	if (DEBUG){
		var test=Xyz2Rgb(output);
		if (!Map.equals(rgb, test)){
			Log.error("");
		}//endif
	}//endif
	return output;
}//method


/**
* @brief Transform CIE XYZ to sRGB with the D65 white point
*
* @param R, G, B pointers to hold the result
* @param X, Y, Z the input XYZ values
*
* Official sRGB specification (IEC 61966-2-1:1999)
* Poynton, "Frequently Asked Questions About Color," page 10
* Wikipedia: http://en.wikipedia.org/wiki/SRGB
* Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space
*/
function Xyz2Rgb(xyz){
	var R1 = ( 3.2406*xyz.X - 1.5372*xyz.Y - 0.4986*xyz.Z);
	var G1 = (-0.9689*xyz.X + 1.8758*xyz.Y + 0.0415*xyz.Z);
	var B1 = ( 0.0557*xyz.X - 0.2040*xyz.Y + 1.0570*xyz.Z);

	var Min = Math.min(R1, G1, B1);

	/* Force nonnegative values so that gamma correction is well-defined. */
	if(Min < 0){
		R1 -= Min;
		G1 -= Min;
		B1 -= Min;
	}

	/* Transform from RGB to R'G'B' */
	return new ColorRGB(GAMMACORRECTION(R1), GAMMACORRECTION(G1), GAMMACORRECTION(B1));
}


/**
* Convert CIE XYZ to CIE L*a*b* (CIELAB) with the D65 white point
* Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space
*/
function Xyz2Lab(xyz){
	var X = LABF(xyz.X / WHITEPOINT_X);
	var Y = LABF(xyz.Y / WHITEPOINT_Y);
	var Z = LABF(xyz.Z / WHITEPOINT_Z);

	var L = 116*Y - 16;
	var a = 500*(X - Y);
	var b = 200*(Y - Z);

	return new ColorLab(L, a, b)
}


/**
* Convert CIE L*a*b* (CIELAB) to CIE XYZ with the D65 white point
* Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space
*/
function Lab2Xyz(Lab){
	var L = (Lab.L + 16)/116;
	var a = L + Lab.a/500;
	var b = L - Lab.b/200;

	var X = WHITEPOINT_X*LABINVF(a);
	var Y = WHITEPOINT_Y*LABINVF(L);
	var Z = WHITEPOINT_Z*LABINVF(b);
	return new ColorXYZ(X, Y, Z);
}

//
///**
// * Convert CIE XYZ to CIE L*u*v* (CIELUV) with the D65 white point
// *
// * @param L, u, v pointers to hold the result
// * @param X, Y, Z the input XYZ values
// *
// * Wikipedia: http://en.wikipedia.org/wiki/CIELUV_color_space
// */
function Xyz2Luv(xyz){
	var u1, v1;

	var Denom = xyz.X + 15*xyz.Y + 3*xyz.Z;
	if((Denom) > 0){
		u1 = (4*xyz.X) / Denom;
		v1 = (9*xyz.Y) / Denom;
	}else{
		u1 = v1 = 0;
	}//endif

	var Y = xyz.Y / WHITEPOINT_Y;
	Y = LABF(Y);

	var L = 116*Y - 16;
	var u = 13*L*(u1 - WHITEPOINT_U);
	var v = 13*L*(v1 - WHITEPOINT_V);

 	var output=new ColorLUV(L, u, v);
	if (DEBUG){
		var test=Luv2Xyz(output);
		if (!Map.equals(xyz, test)){
			Log.error("");
		}//endif
	}//endif
	return output;


}
//
//
/**
* Convert CIE L*u*v* (CIELUV) to CIE XYZ with the D65 white point
*
* @param X, Y, Z pointers to hold the result
* @param L, u, v the input L*u*v* values
*
* Wikipedia: http://en.wikipedia.org/wiki/CIELUV_color_space
*/
function Luv2Xyz(luv){
	var Y = (luv.L + 16)/116;
	Y = WHITEPOINT_Y*LABINVF(Y);

	var u=luv.U;
	var v=luv.V;
	if(luv.L != 0){
		u /= luv.L;
		v /= luv.L;
	}
	u = u/13 + WHITEPOINT_U;
	v = v/13 + WHITEPOINT_V;

	var X = Y * ((9*u)/(4*v));
	var Z = Y * ((3 - 0.75*u)/v - 5);
	return new ColorXYZ(X, Y, Z);
}


/**
* Convert CIE XYZ to CIE L*C*H* with the D65 white point
* CIE L*C*H* is related to CIE L*a*b* by
*    a* = C* cos(H* pi/180),
*    b* = C* sin(H* pi/180).
*/
function Xyz2Lch(xyz){
	var lab = Xyz2Lab(xyz);
	var C = Math.sqrt(lab.a*lab.a + lab.b*lab.b);
	var H = Math.atan2(lab.b, lab.a)*180.0/Math.PI;

	if(H < 0)
		H += 360;

	var output = new ColorLch(lab.L, C, H);
	if (DEBUG){
		var test = Lch2Xyz(output);
		if (!Map.equals(xyz, test)){
			Log.error("");
		}//endif
	}//endif

	return output;
}

/**
* Convert CIE L*C*H* to CIE XYZ with the D65 white point
*
* @param X, Y, Z pointers to hold the result
* @param L, C, H the input L*C*H* values
*/
function Lch2Xyz(lch){
	var a = lch.c * Math.cos(lch.h*(Math.PI/180.0));
	var b = lch.c * Math.sin(lch.h*(Math.PI/180.0));


	return Lab2Xyz(new ColorLab(lch.L, a, b));
}


///** @brief XYZ to CAT02 LMS */
//void Xyz2Cat02lms(num *L, num *M, num *S, num X, num Y, num Z)
//{
//	*L = (num)( 0.7328*X + 0.4296*Y - 0.1624*Z);
//	*M = (num)(-0.7036*X + 1.6975*Y + 0.0061*Z);
//	*S = (num)( 0.0030*X + 0.0136*Y + 0.9834*Z);
//}
//
//
///** @brief CAT02 LMS to XYZ */
//void Cat02lms2Xyz(num *X, num *Y, num *Z, num L, num M, num S)
//{
//	*X = (num)( 1.096123820835514*L - 0.278869000218287*M + 0.182745179382773*S);
//	*Y = (num)( 0.454369041975359*L + 0.473533154307412*M + 0.072097803717229*S);
//	*Z = (num)(-0.009627608738429*L - 0.005698031216113*M + 1.015325639954543*S);
//}
//
//
///*
// * == Glue functions for multi-stage transforms ==
// */
//
//void Rgb2Lab(num *L, num *a, num *b, num R, num G, num B)
//{
//	num X, Y, Z;
//	Rgb2Xyz(&X, &Y, &Z, R, G, B);
//	Xyz2Lab(L, a, b, X, Y, Z);
//}
//
//
//void Lab2Rgb(num *R, num *G, num *B, num L, num a, num b)
//{
//	num X, Y, Z;
//	Lab2Xyz(&X, &Y, &Z, L, a, b);
//	Xyz2Rgb(R, G, B, X, Y, Z);
//}
//
//
function Rgb2Luv(rgb){
	var xyz=Rgb2Xyz(rgb);
	return Xyz2Luv(xyz);
}


function Luv2Rgb(luv){
	return Xyz2Rgb(Luv2Xyz(luv));
}

function Rgb2Lch(rgb){
	return Xyz2Lch(Rgb2Xyz(rgb));
}

function Lch2Rgb(lch){
	return Xyz2Rgb(Lch2Xyz(lch));
}

//
//void Rgb2Cat02lms(num *L, num *M, num *S, num R, num G, num B)
//{
//	num X, Y, Z;
//	Rgb2Xyz(&X, &Y, &Z, R, G, B);
//	Xyz2Cat02lms(L, M, S, X, Y, Z);
//}
//
//
//void Cat02lms2Rgb(num *R, num *G, num *B, num L, num M, num S)
//{
//	num X, Y, Z;
//	Cat02lms2Xyz(&X, &Y, &Z, L, M, S);
//	Xyz2Rgb(R, G, B, X, Y, Z);
//}
//
//
//
///*
// * == Interface Code ==
// * The following is to define a function GetColorTransform with a convenient
// * string-based interface.
// */
//
///** @brief Convert a color space name to an integer ID */
//static int IdFromName(const char *Name)
//{
//	if(!strcmp(Name, "rgb") || *Name == 0)
//		return RGB_SPACE;
//	else if(!strcmp(Name, "yuv"))
//		return YUV_SPACE;
//	else if(!strcmp(Name, "ycbcr"))
//		return YCBCR_SPACE;
//	else if(!strcmp(Name, "jpegycbcr"))
//		return YCBCR_SPACE;
//	else if(!strcmp(Name, "ypbpr"))
//		return YPBPR_SPACE;
//	else if(!strcmp(Name, "ydbdr"))
//		return YDBDR_SPACE;
//	else if(!strcmp(Name, "yiq"))
//		return YIQ_SPACE;
//	else if(!strcmp(Name, "hsv") || !strcmp(Name, "hsb"))
//		return HSV_SPACE;
//	else if(!strcmp(Name, "hsl") || !strcmp(Name, "hls"))
//		return HSL_SPACE;
//	else if(!strcmp(Name, "hsi"))
//		return HSI_SPACE;
//	else if(!strcmp(Name, "xyz") || !strcmp(Name, "ciexyz"))
//		return XYZ_SPACE;
//	else if(!strcmp(Name, "lab") || !strcmp(Name, "cielab"))
//		return LAB_SPACE;
//	else if(!strcmp(Name, "luv") || !strcmp(Name, "cieluv"))
//		return LUV_SPACE;
//	else if(!strcmp(Name, "lch") || !strcmp(Name, "cielch"))
//		return LCH_SPACE;
//	else if(!strcmp(Name, "cat02lms") || !strcmp(Name, "ciecat02lms"))
//		return CAT02LMS_SPACE;
//	else
//		return UNKNOWN_SPACE;
//}
//
//
///**
// * @brief Given a transform string, returns a colortransform struct
// *
// * @param Trans a colortransform pointer to hold the transform
// * @param TransformString string specifying the transformations
// * @return 1 on success, 0 on failure
// *
// * This function provides a convenient interface to the collection of transform
// * functions in this file.  TransformString specifies the source and
// * destination color spaces,
// *    TransformString = "dest<-src"
// * or alternatively,
// *    TransformString = "src->dest".
// *
// * Supported color spaces are
// *    "RGB"             sRGB Red Green Blue (ITU-R BT.709 gamma-corrected),
// *    "YPbPr"           Luma (ITU-R BT.601) + Chroma,
// *    "YCbCr"           Luma + Chroma ("digitized" version of Y'PbPr),
// *    "JPEG-YCbCr"      Luma + Chroma space used in JFIF JPEG,
// *    "YUV"             NTSC PAL Y'UV Luma + Chroma,
// *    "YIQ"             NTSC Y'IQ Luma + Chroma,
// *    "YDbDr"           SECAM Y'DbDr Luma + Chroma,
// *    "HSV" or "HSB"    Hue Saturation Value/Brightness,
// *    "HSL" or "HLS"    Hue Saturation Luminance,
// *    "HSI"             Hue Saturation Intensity,
// *    "XYZ"             CIE XYZ,
// *    "Lab"             CIE L*a*b* (CIELAB),
// *    "Luv"             CIE L*u*v* (CIELUV),
// *    "LCH"             CIE L*C*H* (CIELCH),
// *    "CAT02 LMS"       CIE CAT02 LMS.
// * Color space names are case-insensitive and spaces are ignored.  When sRGB
// * is the source or destination, it can be omitted.  For example "yuv<-" is
// * short for "yuv<-rgb".
// *
// * The routine returns a colortransform structure representing the transform.
// * The transform is performed by calling GetColorTransform.  For example,
//@code
//       num S[3] = {173, 0.8, 0.5};
//       num D[3];
//       colortransform Trans;
//
//       if(!(GetColorTransform(&Trans, "HSI -> Lab")))
//       {
//           printf("Invalid syntax or unknown color space\n");
//           return;
//       }
//
//       ApplyColorTransform(Trans, &D[0], &D[1], &D[2], S[0], S[1], S[2]);
//@endcode
// */
//int GetColorTransform(colortransform *Trans, const char *TransformString)
//{
//	int LeftNumChars = 0, RightNumChars = 0, LeftSide = 1, LeftToRight = 0;
//	int i, j, SrcSpaceId, DestSpaceId;
//	char LeftSpace[16], RightSpace[16], c;
//
//
//	Trans->NumStages = 0;
//	Trans->Fun[0] = 0;
//	Trans->Fun[1] = 0;
//
//	/* Parse the transform string */
//	while(1)
//	{
//		c = *(TransformString++);	/* Read the next character */
//
//		if(!c)
//			break;
//		else if(c == '<')
//		{
//			LeftToRight = 0;
//			LeftSide = 0;
//		}
//		else if(c == '>')
//		{
//			LeftToRight = 1;
//			LeftSide = 0;
//		}
//		else if(c != ' ' && c != '-' && c != '=')
//		{
//			if(LeftSide)
//			{	/* Append the character to LeftSpace */
//				if(LeftNumChars < 15)
//					LeftSpace[LeftNumChars++] = tolower(c);
//			}
//			else
//			{	/* Append the character to RightSpace */
//				if(RightNumChars < 15)
//					RightSpace[RightNumChars++] = tolower(c);
//			}
//		}
//	}
//
//	/* Append null terminators on the LeftSpace and RightSpace strings */
//	LeftSpace[LeftNumChars] = 0;
//	RightSpace[RightNumChars] = 0;
//
//	/* Convert names to colorspace enum */
//	if(LeftToRight)
//	{
//		SrcSpaceId = IdFromName(LeftSpace);
//		DestSpaceId = IdFromName(RightSpace);
//	}
//	else
//	{
//		SrcSpaceId = IdFromName(RightSpace);
//		DestSpaceId = IdFromName(LeftSpace);
//	}
//
//	/* Is either space is unknown? (probably a parsing error) */
//	if(SrcSpaceId == UNKNOWN_SPACE || DestSpaceId == UNKNOWN_SPACE)
//		return 0;	/* Return failure */
//
//	/* Is this an identity transform? */
//	if(SrcSpaceId == DestSpaceId)
//		return 1;	/* Return successfully */
//
//	/* Search the TransformPair table for a direct transformation */
//	for(i = 0; i < NUM_TRANSFORM_PAIRS; i++)
//	{
//		if(SrcSpaceId == TransformPair[i].Space[0]
//			&& DestSpaceId == TransformPair[i].Space[1])
//		{
//			Trans->NumStages = 1;
//			Trans->Fun[0] = TransformPair[i].Fun[0];
//			return 1;
//		}
//		else if(DestSpaceId == TransformPair[i].Space[0]
//			&& SrcSpaceId == TransformPair[i].Space[1])
//		{
//			Trans->NumStages = 1;
//			Trans->Fun[0] = TransformPair[i].Fun[1];
//			return 1;
//		}
//	}
//
//	/* Search the TransformPair table for a two-stage transformation */
//	for(i = 1; i < NUM_TRANSFORM_PAIRS; i++)
//		if(SrcSpaceId == TransformPair[i].Space[1])
//			for(j = 0; j < i; j++)
//			{
//				if(DestSpaceId == TransformPair[j].Space[1]
//					&& TransformPair[i].Space[0] == TransformPair[j].Space[0])
//				{
//					Trans->NumStages = 2;
//					Trans->Fun[0] = TransformPair[i].Fun[1];
//					Trans->Fun[1] = TransformPair[j].Fun[0];
//					return 1;
//				}
//			}
//		else if(DestSpaceId == TransformPair[i].Space[1])
//			for(j = 0; j < i; j++)
//			{
//				if(SrcSpaceId == TransformPair[j].Space[1]
//					&& TransformPair[j].Space[0] == TransformPair[i].Space[0])
//				{
//					Trans->NumStages = 2;
//					Trans->Fun[0] = TransformPair[j].Fun[1];
//					Trans->Fun[1] = TransformPair[i].Fun[0];
//					return 1;
//				}
//			}
//
//	return 0;
//}
//
//
///**
// * @brief Apply a colortransform
// *
// * @param Trans colortransform struct created by GetColorTransform
// * @param D0, D1, D2 pointers to hold the result
// * @param S0, S1, S2 the input values
// */
//void ApplyColorTransform(colortransform Trans,
//	num *D0, num *D1, num *D2, num S0, num S1, num S2)
//{
//	switch(Trans.NumStages)
//	{
//	case 1:
//		Trans.Fun[0](D0, D1, D2, S0, S1, S2);
//		break;
//	case 2:
//		{
//			num T0, T1, T2;
//			Trans.Fun[0](&T0, &T1, &T2, S0, S1, S2);
//			Trans.Fun[1](D0, D1, D2, T0, T1, T2);
//		}
//		break;
//	default:
//		*D0 = S0;
//		*D1 = S1;
//		*D2 = S2;
//		break;
//	}
//}
//
//
///* The code below allows this file to be compiled as a MATLAB MEX function.
// * From MATLAB, the calling syntax is
// *    B = colorspace('dest<-src', A);
// * See colorspace.m for details.
// */
//#ifdef MATLAB_MEX_FILE
///** @brief MEX gateway */
//void mexFunction(int nlhs, mxArray *plhs[], int nrhs, const mxArray*prhs[])
//{
//    #define	S_IN	     prhs[0]
//    #define	A_IN	     prhs[1]
//    #define	B_OUT	     plhs[0]
//#define IS_REAL_FULL_DOUBLE(P) (!mxIsComplex(P) \
//&& !mxIsSparse(P) && mxIsDouble(P))
//	num *A, *B;
//	char *SBuf;
//	const int *Size;
//	colortransform Trans;
//	int SBufLen, NumPixels, Channel, Channel2;
//
//
//    /* Parse the input arguments */
//    if(nrhs != 2)
//        mexErrMsgTxt("Two input arguments required.");
//    else if(nlhs > 1)
//        mexErrMsgTxt("Too many output arguments.");
//
//	if(!mxIsChar(S_IN))
//		mexErrMsgTxt("First argument should be a string.");
//    if(!IS_REAL_FULL_DOUBLE(A_IN))
//        mexErrMsgTxt("Second argument should be a real full double array.");
//
//	Size = mxGetDimensions(A_IN);
//
//	if(mxGetNumberOfDimensions(A_IN) > 3
//		|| Size[mxGetNumberOfDimensions(A_IN) - 1] != 3)
//		mexErrMsgTxt("Second argument should be an Mx3 or MxNx3 array.");
//
//	/* Read the color transform from S */
//	SBufLen = mxGetNumberOfElements(S_IN)*sizeof(mxChar) + 1;
//	SBuf = mxMalloc(SBufLen);
//	mxGetString(S_IN, SBuf, SBufLen);
//
//	if(!(GetColorTransform(&Trans, SBuf)))
//		mexErrMsgTxt("Invalid syntax or unknown color space.");
//
//	mxFree(SBuf);
//
//	A = (num *)mxGetData(A_IN);
//	NumPixels = mxGetNumberOfElements(A_IN)/3;
//
//	/* Create the output image */
//	B_OUT = mxCreateDoubleMatrix(0, 0, mxREAL);
//	mxSetDimensions(B_OUT, Size, mxGetNumberOfDimensions(A_IN));
//	mxSetData(B_OUT, B = mxMalloc(sizeof(num)*mxGetNumberOfElements(A_IN)));
//
//	Channel = NumPixels;
//	Channel2 = NumPixels*2;
//
//	/* Apply the color transform */
//	while(NumPixels--)
//	{
//		ApplyColorTransform(Trans, B, B + Channel, B + Channel2,
//			A[0], A[Channel], A[Channel2]);
//		A++;
//		B++;
//	}
//
//    return;
//}
//#endif

})();
