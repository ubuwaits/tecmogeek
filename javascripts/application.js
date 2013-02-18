$(document).ready(function() {
  $(".toggle-rushing").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te rushing");
    return false;
  });

  $(".toggle-receiving").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te receiving");
    return false;
  });

  $(".toggle-kick-return").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te kick-return");
    return false;
  });

  $(".toggle-punt-return").click(function() {
    $(".players.rb-wr-te").removeClass().addClass("players rb-wr-te punt-return");
    return false;
  });
});

