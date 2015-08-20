/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

//Please keep the owner names consistent with phonebook names

var OWNERS = {
  "AudioChannel": "Steven Lee", // Firefox OS
  "B2g Installer": "Gregor Wagner (Alex Lissy, Dale Harvey)",
  "BetaTriage": "?", // Firefox OS
  "Bluetooth": "Ben Tian (Shawn Huang)", // Firefox OS
  "Build Config": "Dylan Oliver", // Core
  "Canvas: 2D": "Milan Sreckovic (Benoit Jacob, Jeff Muizelaar)",
  "Canvas: WebGL": "Milan Sreckovic (Benoit Jacob, Jeff Gilbert)",
  "Certification Suite": "Kevin Hu",
  "CSS Parsing and Computation": "Jet Villegas",
  "Developer Tools": "Jan Keromnes (Alexandre Poirot, Ryan Stinnett)",
  "Emulator": "Thomas Zimmermann (Edgar Chen)", // Firefox OS
  "FindMyDevice": "Alexandre Lissy, Mark Goodwin, Jared Hirsch",
  "FxA": "Chris Karlof", // Firefox OS
  "DOM: Apps": "Fabrice Desré",
  "DOM: Core & HTML": "Andrew Overholt (Johnny Stenback)", // DOM
  "DOM": "Andrew Overholt (2nd: Johnny Stenback)", // DOM
  "DOM: Contacts": "David Scravaglieri (Francisco Jordano)", // DOM
  "DOM: Device Interfaces": "Andrew Overholt (Johnny Stenback)", // DOM
  "DOM: Events": "Andrew Overholt (Johnny Stenback)",
  "Gaia": "David Scravaglieri (Francisco Jordano)",
  // "Gaia:: Achievements": "?",
  "Gaia::Bluetooth File Transfer": "Tim Guan-tin Chien (Ian Liu)",
  "Gaia:: Bookmark": "Gregor Wagner (Ben Francis)",
  "Gaia::Browser": "Gregor Wagner (Ben Francis)",
  "Gaia:: Bugzilla Lite": "Dale Harvey",
  "Gaia::Build": "Tim Guan-tin Chien (Yuren Ju)",
  "Gaia::Calendar": "Dylan Oliver (Gareth Aye)",
  "Gaia::Camera": "Hema Koka (David Flanagan)",
  "Gaia::Clock": "Dylan Oliver (Marcus Cavanaugh)",
  "Gaia:: Components": "Wilson Page",
  "Gaia::Contacts": "David Scravaglieri (Francisco Jordano)",
  "Gaia::Cost Control": "David Scravaglieri (Francisco Jordano)",
  "Gaia:: Customizer": "Doug Sherk",
  "Gaia::Dialer": "David Scravaglieri (Francisco Jordano)",
  "Gaia::E-Mail": "Dylan Oliver (Andrew Sutherland)",
  "Gaia::Everything.me": "Gregor Wagner (Chris Lord)",
  // "Gaia:: Feedback": "?",
  "Gaia::First Time Experience": "Gregor Wagner (Sam Foster)",
  "Gaia::FMRadio": "Hema Koka (David Flanagan)",
  "Gaia:: Foxfooding": "Jean Gong",
  "Gaia::Gallery": "Hema Koka (David Flanagan)",
  "Gaia::GithubBot": "Kevin Grandon",
  "Gaia:: Hackerplace": "Michael Henretty",
  "Gaia::Homescreen": "Gregor Wagner (Chris Lord)",
  "Gaia::Keyboard": "Tim Guan-tin Chien (Rudy Lu)",
  "Gaia:: L10n": "Zibi Braniecki (Stas Malolepszy)",
  // "Gaia:: Loop": "?",
  "Gaia::Music": "Hema Koka (David Flanagan)",
  "Gaia:: Network Alerts": "Steve Chung (Julien Wajsberg, Aleh Zasypkin)",
  "Gaia::Notes": "Dylan Oliver",
  // "Gaia:: P2P Sharing": "?",
  // "Gaia::PDF Viewer": "?",
  "Gaia::PerformanceTest": "Eli Perelman (Rob Wood, TingYu Chou)",
  "Gaia:: Project Infrastructure": "Gareth Aye (Ghislain Locroix, Eli Perelman, Kevin Grandon)",
  "Gaia::Ringtones": "Hema Koka (David Flanagan)",
  "Gaia::Search": "Gregor Wagner (Kevin Grandon)",
  "Gaia::Settings": "Tim Guan-tin Chien",
  "Gaia:: Shared": "David Flanagan (Kevin Grandon)",
  "Gaia::SMS": "David Scravaglieri (Francisco Jordano)",
  "Gaia::System": "Michael Henretty (Gregor Wagner, Tim Guan-tin)", //  Tim relies on Gregor to actively throwing bugs over.
  "Gaia::System::Accessibility": "Eithan Isaacson, Yura Zenevich",
  // "Gaia::System::Audio Mgmt": "Alive?",
  "Gaia::System::Browser Chrome": "Gregor Wagner (Ben Francis)",
  "Gaia::System::Download": "Gregor Wagner (Aus Lacroix)",
  "Gaia::System::Input Mgmt": "Tim Guan-tin Chien (Rudy Lu)",
  "Gaia::System::Lockscreen": "Tim Guan-tin Chien (Greg Weng)",
  "Gaia::System::Mobile Connection": "Etienne Segonzac, Sean McArthur",
  "Gaia::System::MobileID": "Fernando Jiménez Moreno",
  "Gaia::System::Music Control": "Evan?",
  "Gaia::System::Payments": "Fernando Jiménez Moreno",
  // "Gaia::System::Power Mgmt": "?",
  // "Gaia::System::SIM Tool Kit": "?",
  "Gaia::System::Status Bar, Utility Tray, Notification": "Michael Henretty",
  // "Gaia::System::Storage Mgmt": "?",
  "Gaia::System::System UI": "Michael Henretty",
  "Gaia::System::Task Manager": "Gregor Wagner (Sam Foster)",
  "Gaia::System::WebRTC": "Fred Lin",
  "Gaia::System::Wifi": "Tim Guantin Chien",
  "Gaia::System::Window Mgmt": "Tim Guan-tin Chien",
  // "Gaia::TestAgent": "Garreth Aye, Aus Lacroix",
  // "Gaia::Theme Editor": "?",
  // "Gaia::TV": "?",
  // "Gaia::TV:: Home": "?",
  // "Gaia::TV:: System": "?",
  "Gaia::UI Tests": "Dylan Oliver (Gareth Aye)",
  "Gaia::Video": "Hema Koka (David Flanagan)",
  "Gaia::VoiceControl": "Dylan Oliver (Kelly Davis)",
  "Gaia::Wallpaper": "David Flanagan (Punam Dahiya)",
  "Gaia::Wappush": "David Scravaglieri (Francisco Jordano)",
  "General (Firefox OS)": "Mahendranadh Potharaju",
  "General (Core)": "Lawrence Mandel",
  "General (Loop+)": "Lawrence Mandel",
  "GonkIntegration": "Thomas Tsai", // Firefox OS
  "General Automation": "Jonathan Griffin", // Release Engineering
  "Geolocation": "Doug Turner", // Core
  "Graphics": "Milan Sreckovic (Jeff Muizelaar, Benoit Girard)", // Core
  "Graphics: Layers": "Milan Sreckovic (Bas Schouten, Benoit Girard)", // Core
  // "Hardware": "?", // Firefox OS
  "Hardware Abstraction Layer (HAL)": "Dave Hylands", // Core
  "ImageLib": "Milan Sreckovic (Jeff Muizelaar, Seth Fowler)",
  // "Infrastructure": "?",
  "IPC": "Andrew Overholt (Johnny Stenback)",
  "JavaScript Engine": "Naveed Ihsanullah", // Core
  "JavaScript: GC": "Naveed Ihsanullah", // Core
  "Layout": "Jet Villegas", // Core
  // "MCTS Waiver Request": "?",
  "MTP/UMS": "Ben Tian", // Firefox OS
  "MFBT": "Naveed Ihsanullah",
  "Networking": "Jason Duell", // Core
  "NFC": "Vincent Chang", // Firefox OS
  "rtsp": "Vincent Chang", // Firefox OS
  "Panning and Zooming": "Milan Sreckovic (Kartikaya Gupta, Botond Ballo)", // Core
  "Performance": "Everyone", // Firefox OS
  "Runtime": "Gregor Wagner (Fabrice Desré)", // Firefox OS
  // "Simulator": "?", // Firefox OS
  "RIL": "Hsinyi Tsai", // Firefox OS
  // "RSTP": "?",
  // "Runtime": "?",
  // "Stimulator": "?",
  // "Stability": "Al Tsai",
  // "Sync": "Fernando Jimenez"
  "Video/Audio": "Jet Villegas", // Core
  "Video/Audio: Recording": "Steven Lee", // Core
  "Vendcom": "Vance Chen", // Firefox OS
  "Widget: Gonk": "Mike Wu",
  "Wifi": "Vincent Chang" // Firefox OS
  // "WMF": "?" // Firefox OS
};



