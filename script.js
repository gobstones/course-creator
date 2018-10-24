function createRepo(organization, repository, token) {
  return $.ajax({
    type: "POST",
    url: `https://api.github.com/orgs/${organization}/repos`,
    data: JSON.stringify({ name: repository, auto_init: true }),
    dataType: "json",
    headers: {
      "Authorization": `token ${token}`
    }
  });
}

function getMasterSha(slug, token) {
  return $.getJSON({
    url: `https://api.github.com/repos/${slug}/git/refs/heads/master`,
    headers: {
      "Authorization": `token ${token}`
    }
  }).then((res) => res.object.sha);
}

function createBranch(slug, branch, token) {
  return getMasterSha(slug, token).then((sha) => {
    return $.ajax({
      type: "POST",
      url: `https://api.github.com/repos/${slug}/git/refs`,
      data: JSON.stringify({ ref: `refs/heads/${branch}`, sha: sha }),
      dataType: "json",
      headers: {
        "Authorization": `token ${token}`
      }
    });
  });
}

function createFile(slug, path, message, content, branch = "master", token) {
  return $.ajax({
    type: "PUT",
    url: `https://api.github.com/repos/${slug}/contents/${path}`,
    data: JSON.stringify({ message: message, content: btoa(content), branch: branch }),
    dataType: "json",
    headers: {
      "Authorization": `token ${token}`
    }
  });
}

function gobstonesCoursePage(type, courseSlug) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset=utf-8>
      <title>Gobstones ${type.toUpperCase()}</title>
    </head>
    <body>
      <iframe src="https://gobstones.github.io/gobstones-${type}?course=${courseSlug}&embed=true" style="border: 0; position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%">
    </body>
    </html>`;
}

$(document).ready(() => {
  $("button").click((e) => {
    e.preventDefault();

    const name = $("#name").val();
    const courseSlug = $("#slug").val();
    const token = $("#token").val();
    const type = $('input[name=type]:checked').val();

    if (name === "" || courseSlug === "" || token === "") return;

    const organization = "gobstones";
    const repository = `course-${name}`;
    const slug = `${organization}/${repository}`;
    const branch = "gh-pages";

    $("button").attr("disabled", true);

    createRepo(organization, repository, token).then((result) => {
      return createBranch(slug, branch, token).then((result) => {
        return createFile(slug, "index.html", `Creating ${name}...`, gobstonesCoursePage(type, courseSlug), branch, token).then((result) => {
          alert(`https://gobstones.github.io/${repository}/`);
        });
      });
    }).catch((e) => {
      alert("Something wrong happened: " + (e.responseJSON && e.responseJSON.message) || "???");
    }).always(() => {
      $("button").removeAttr("disabled");
    });
  });
});
