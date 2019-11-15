
$(document).ready(function() {

  var articleContainer = $(".article-container");

  $(document).on("click", ".btn.delete", articleDelete);
  $(document).on("click", ".btn.notes", articleNotes);
  $(document).on("click", ".btn.save", noteSave);
  $(document).on("click", ".btn.note-delete", noteDelete);
  $(".clear").on("click", articleClear);

  function initPage() {
 
    $.get("/api/headlines?saved=true").then(function(data) {
      articleContainer.empty();

      if (data && data.length) {
        renderArticles(data);
      } else {

        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {

    var articleCards = [];

    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }

    articleContainer.append(articleCards);
  }

  function createCard(article) {

    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr("href", article.url)
          .text(article.headline),
        $("<a class='btn btn-danger delete'>Delete From Saved</a>"),
        $("<a class='btn btn-info notes'>Article Notes</a>")
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.summary);

    card.append(cardHeader, cardBody);


    card.data("_id", article._id);

    return card;
  }

  function renderEmpty() {

    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );

    articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {

    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {

      currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
      notesToRender.push(currentNote);
    } else {

      for (var i = 0; i < data.notes.length; i++) {

        currentNote = $("<li class='list-group-item note'>")
          .text(data.notes[i].noteText)
          .append($("<button class='btn btn-danger note-delete'>x</button>"));

        currentNote.children("button").data("_id", data.notes[i]._id);

        notesToRender.push(currentNote);
      }
    }

    $(".note-container").append(notesToRender);
  }

  function articleDelete() {

    var articleToDelete = $(this)
      .parents(".card")
      .data();


    $(this)
      .parents(".card")
      .remove();

    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {

      if (data.ok) {
        initPage();
      }
    });
  }
  function articleNotes(event) {

    var currentArticle = $(this)
      .parents(".card")
      .data();

    $.get("/api/notes/" + currentArticle._id).then(function(data) {

      var modalText = $("<div class='container-fluid text-center'>").append(
        $("<h4>").text("Notes For Article: " + currentArticle._id),
        $("<hr>"),
        $("<ul class='list-group note-container'>"),
        $("<textarea placeholder='New Note' rows='4' cols='60'>"),
        $("<button class='btn btn-success save'>Save Note</button>")
      );

      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      // Adding some information about the article and article notes to the save button for easy access
      // When trying to add a new note
      $(".btn.save").data("article", noteData);
      // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
      renderNotesList(noteData);
    });
  }

  function noteSave() {

    var noteData;
    var newNote = $(".bootbox-body textarea")
      .val()
      .trim();

    if (newNote) {
      noteData = { _headlineId: $(this).data("article")._id, noteText: newNote };
      $.post("/api/notes", noteData).then(function() {

        bootbox.hideAll();
      });
    }
  }

  function noteDelete() {

    var noteToDelete = $(this).data("_id");

    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {

      bootbox.hideAll();
    });
  }

  function articleClear() {
    $.get("api/clear")
      .then(function() {
        articleContainer.empty();
        initPage();
      });
  }
});
