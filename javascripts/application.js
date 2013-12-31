$(document).ready(function() {
  //$('.player-listing').tsort('.rushing-rating a', {order: 'desc'});

  // Show/hide WR & TE on rushers page
  // ***************************************************************************
  $(".rusher-toggle .show-all").click(function() {
    $(".player-WR1, .player-WR2, .player-WR3, .player-WR4, .player-WR5, .player-WR6, .player-TE1, .player-TE2").show();
    $(".only-rb").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".rusher-toggle .only-rb").click(function() {
    $(".player-WR1, .player-WR2, .player-WR3, .player-WR4, .player-WR5, .player-WR6, .player-TE1, .player-TE2").hide();
    $(".show-all").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  // Show/hide RB on receivers page
  // ***************************************************************************
  $(".receiver-toggle .show-all").click(function() {
    $(".player-RB1, .player-RB2, .player-RB3, .player-RB4").show();
    $(".only-wr").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".receiver-toggle .only-wr").click(function() {
    $(".player-RB1, .player-RB2, .player-RB3, .player-RB4").hide();
    $(".show-all").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  // Toggle between position ratings on team page
  // ***************************************************************************
  $(".toggle-default").click(function() {
    $('.player-listing').tsort({data: 'number'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-rushing").click(function() {
    $('.player-listing').tsort('.rushing-rating a', {order: 'desc'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-receiving").click(function() {
    $('.player-listing').tsort('.receiving-rating a', {order: 'desc'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te receiving");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-kick-return").click(function() {
    $('.player-listing').tsort('.kick-return-rating a', {order: 'desc'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te kick-return");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-punt-return").click(function() {
    $('.player-listing').tsort('.punt-return-rating a', {order: 'desc'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te punt-return");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $("nav li.nav-teams > a").click(function() {
    $("nav li.nav-players > a").removeClass("active");
    $("nav li.nav-players > ol").hide();
    $("nav li.nav-teams > a").toggleClass("active");
    $("nav li.nav-teams > ol").toggle();
    return false;
  });

  $("nav li.nav-players > a").click(function() {
    $("nav li.nav-teams > a").removeClass("active");
    $("nav li.nav-teams > ol").hide();
    $("nav li.nav-players > a").toggleClass("active");
    $("nav li.nav-players > ol").toggle();
    return false;
  });

  $("a").tooltip();
});

