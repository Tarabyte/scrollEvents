scrollEvents.changeStyle(".foo", "height", "25%", "75%");
scrollEvents.changeStyle(".foo", "backgroundColor", "#008cff", "#00ad85");
scrollEvents.changeText(".foo", "Scroll down to change stuff.", "Now we are taller and greener!");
scrollEvents.changeText("#corner__box", "At the top.", "You have scrolled!");
scrollEvents.changeClass('.bar', 'nonscrolled', 'scrolled');
scrollEvents.changeHTML('.bar', 'Scroll down to change css class.', 'We use changeClass. <br> <= That guy uses inline styles, EWWW.');

// need to make this happen
//scrollEvents.changeClass('.bar', 'nonscrolled', 'scrolled').changeText('.bar', 'Initial.', 'Changed.');