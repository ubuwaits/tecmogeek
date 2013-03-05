$(document).ready(function() {
  $(".toggle-rushing").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-receiving").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te receiving");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-kick-return").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te kick-return");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $(".toggle-punt-return").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te punt-return");
    $(".skill-toggles li a").removeClass("active");
    $(this).addClass("active");
    return false;
  });

  $("nav li.nav-teams > a").click(function() {
    $("nav li.nav-teams > a").toggleClass("active");
    $("nav li.nav-teams > ol").toggle();
    return false;
  });
});

