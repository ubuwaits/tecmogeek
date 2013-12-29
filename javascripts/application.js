$(document).ready(function() {
  $('.player-listing').tsort('.rushing-ranking a');

  $(".show-all").click(function() {
    $(".player-WR1, .player-WR2, .player-WR3, .player-WR4, .player-WR5, .player-WR6, .player-TE1, .player-TE2").show();
    $(".only-rb").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".only-rb").click(function() {
    $(".player-WR1, .player-WR2, .player-WR3, .player-WR4, .player-WR5, .player-WR6, .player-TE1, .player-TE2").hide();
    $(".show-all").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-default").click(function() {
    $('.player-listing').tsort({data: 'number'});
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-rushing").click(function() {
    $('.player-listing').tsort('.rushing-ranking a');
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-receiving").click(function() {
    $('.player-listing').tsort('.receiving-ranking a');
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te receiving");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-kick-return").click(function() {
    $('.player-listing').tsort('.kick-return-ranking a');
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te kick-return");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-punt-return").click(function() {
    $('.player-listing').tsort('.punt-return-ranking a');
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

