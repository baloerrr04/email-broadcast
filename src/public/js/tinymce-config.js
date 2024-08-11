tinymce.init({
  selector: "#content",
  plugins:
    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
  toolbar:
    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | image media table mergetags",
  ai_request: (request, respondWith) =>
    respondWith.string(() =>
      Promise.reject("See docs to implement AI Assistant")
    ),
  automatic_uploads: true,
  file_picker_types: "file image media",
  file_picker_callback: (cb, value, meta) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Unggah file ke server
            const response = await fetch('/upload', { // Gantilah dengan URL API unggahan Anda
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();

                // Ganti URL blob dengan URL dari server
                cb(data.fileUrl, { title: file.name }); // Pastikan data.fileUrl adalah URL yang dapat diakses secara publik
            } else {
                console.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error during file upload:', error);
        }
    });

    input.click();
},
});
