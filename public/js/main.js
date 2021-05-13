let socket = io();
socket.on("connect", () => {});
socket.on("disconnect", () => {});

const well = new Vue({
  el: ".well",
  data: {
    closeYoutube: false,
    youtube: "",
    content: "",
    images: [],
  },

  methods: {
    stickImages() {
      let inputImage = document.getElementById("form-images");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      if (evt.target.files[0] != null) {
        this.images = evt.target.files;
      }
    },
    async emitPost() {
      let iframeYoutube = "";
      if (this.youtube.trim() != "") {
        let url = new URL(this.youtube.trim());
        let v = url.searchParams.get("v");
        iframeYoutube = "https://www.youtube.com/embed/" + v;
      }

      let data = new FormData();

      for (let i = 0; i < this.images.length; i++) {
        data.append("images", this.images[i], this.images[i].name);
      }
      data.append("content", this.content);
      data.append("youtube", iframeYoutube);
      this.closeYoutube = false;
      this.youtube = "";
      this.content = "";
      this.images = [];
      const newPost = await axios.post("/post", data);

      panel._data.listPost.unshift(newPost.data);
    },
  },
});

const panel = new Vue({
  el: "#list-post",
  data: {
    listPost: [],
    dialogEditPost: false,
    indexPostTargetedEdit: -1,
    contentEdit: "",
    youtubeEdit: "",
    imagesEdit: [],
    deleteImagesEdit: false,
    idPostTargetedEdit: -1,
    isEnd: false,
    turn: 0,
  },

  async created() {
    const listPost =await this.fetchPost()

    this.listPost = listPost;
    console.log(this.listPost);
    window.addEventListener("scroll", this.handleScroll);
  },

  updated() {
    setTooltip();
  },
  watch: {
    async isEnd(value) {
      if (value == true) {
        const listPost =await this.fetchPost()
        if (listPost.length != 0) {
          this.listPost = [...this.listPost, ...listPost];
         
          this.turn++;
        }
        this.isEnd = false;

        
      }
    },
  },

  methods: {
    async fetchPost() {
      const idUser = window.location.search.split("=").slice(-1)[0];

      let listPost;
      if (!idUser) {
        listPost = await axios.get("/post", {
          params: {
            turn: this.turn,
          },
        });
      } else {
        listPost = await axios.get("/post", {
          params: {
            idUser: idUser,
            turn: this.turn,
          },
        });
      }
      
      return listPost.data
    },
    handleScroll(e) {
      $(document).ready(() => {
        let position = $(window).scrollTop();

        let limitScroll = $(document).height() - $(window).height();

        if (position >= limitScroll - 180) {
          this.isEnd = true;
        }
      });
    },
    openComment(idPost) {
      let state = document.getElementById("comment-area" + idPost).style
        .display;

      document.getElementById("comment-area" + idPost).style.display =
        state == "" || state == "none" ? "block" : "none";
    },

    comment(idPost, idUser, indexPost) {
      let targetInput = document.getElementById(
        "input-comment-" + idPost
      ).value;
      const content = targetInput.trim();
      document.getElementById("input-comment-" + idPost).value = "";
      axios
        .post("/comment", {
          message: content,
          idOwner: idUser,
          idPost,
        })
        .then((res) => {
          const newComment = res.data;
          this.listPost[indexPost].listComment.push(newComment);
        });
    },
    deleteComment(idComment, idUser, indexPost, indexComment) {
      axios.delete("/comment", {
        params: {
          idComment,
          idUser,
        },
      });
      this.listPost[indexPost].listComment = [
        ...this.listPost[indexPost].listComment.slice(0, indexComment),
        ...this.listPost[indexPost].listComment.slice(indexComment + 1),
      ];
    },
    leaveHeart(idUser, indexPost, idPost) {
      axios.post("/post/heart", {
        idUser,
        idPost,
      });
      const indexUser = this.listPost[indexPost].heart.indexOf(idUser);
      if (indexUser != -1) {
        this.listPost[indexPost].heart = [
          ...this.listPost[indexPost].heart.slice(0, indexUser),
          ...this.listPost[indexPost].heart.slice(indexUser + 1),
        ];
      } else {
        this.listPost[indexPost].heart.push(idUser);
      }
    },
    checkHeart(idUser, indexPost) {
      const indexUser = this.listPost[indexPost].heart.indexOf(idUser);
      return indexUser != -1 ? true : false;
    },

    openEditPost(indexPost, idPost) {
      if (
        indexPost == this.indexPostTargetedEdit ||
        this.indexPostTargetedEdit == -1
      ) {
        this.dialogEditPost = !this.dialogEditPost;
      }
      this.indexPostTargetedEdit = indexPost;
      this.idPostTargetedEdit = idPost;
      this.contentEdit = this.listPost[indexPost].content;
    },
    stickImages() {
      let inputImage = document.getElementById("form-images-edit");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      if (evt.target.files[0] != null) {
        this.imagesEdit = evt.target.files;
      }
    },
    async emitPost() {
      let iframeYoutube = "";

      if (this.youtubeEdit.trim() != "") {
        let url = new URL(this.youtubeEdit.trim());
        let v = url.searchParams.get("v");
        iframeYoutube = "https://www.youtube.com/embed/" + v;
      }
      console.log(iframeYoutube);
      let data = new FormData();

      for (let i = 0; i < this.imagesEdit.length; i++) {
        data.append("images", this.imagesEdit[i], this.imagesEdit[i].name);
      }
      data.append("content", this.contentEdit);
      data.append("youtube", iframeYoutube);
      data.append("deleteImages", this.deleteImagesEdit);
      data.append("idPost", this.idPostTargetedEdit);

      const newPost = await axios.patch("/post", data);

      this.listPost[this.indexPostTargetedEdit] = newPost.data;
      this.dialogEditPost = false;
      this.contentEdit = "";
      this.youtubeEdit = "";
      this.indexPostTargetedEdit = -1;
      this.idPostTargetedEdit = -1;
      this.imagesEdit = [];
      this.deleteImagesEdit = false;
    },
    deletePost(indexPost, idPost) {
      axios.delete("/post", {
        params: {
          idPost,
        },
      });
      this.listPost.splice(indexPost, 1);
    },
    checkAuth(myId, id) {
      return myId == id ? true : false;
    },
  },
});

const scrollArea = new Vue({
  el: "#inform-tdtu",
  data: {
    openTypeList: false,
    listInform: [],
  },
  async created() {
    const listNewestInform = await axios.get("/inform/api");

    this.listInform = listNewestInform.data;

    socket.on("haveNewInform", (signal) => {
      if (signal == "ok") {
        this.fetchInform();
      }
    });
  },
  methods: {
    async fetchInform() {
      const listNewestInform = await axios.get("/inform/api");

      this.listInform = listNewestInform.data;
    },
    briefText(text, count) {
      return text.substring(0, count) + "...";
    },
    convertTime(time) {
      time = new Date(time).getTime();

      let temp = Math.floor((new Date().getTime() - time) / 1000);

      let tm = {};
      tm.day = Math.floor(temp / (24 * 60 * 60));
      temp = temp - tm.day * 24 * 60 * 60;
      tm.hours = Math.floor(temp / (60 * 60));
      temp = temp - tm.hours * 60 * 60;

      tm.minutes = Math.floor(temp / 60);
      temp = temp - tm.minutes * 60;
      tm.seconds = temp;

      if (tm.day >= 1) {
        return tm.day + +" ngày trước";
      } else if (tm.hours >= 1) {
        return tm.hours + " giờ trước";
      } else if (tm.minutes > 0) {
        return tm.minutes + " phút trước";
      } else {
        return "vừa xong ";
      }
    },
  },
});

const listInform = new Vue({
  el: "#list-inform",

  methods: {
    changeType(event) {
      this.currentTypeTopic = event.target.value;
      if (event.target.value != "") {
        window.location.href = "/inform?type=" + event.target.value;
      } else {
        window.location.href = "/inform";
      }
    },
  },
});

const userInfor = new Vue({
  el: "#user-infor",
  methods: {
    changeAvatar() {
      let inputImage = document.getElementById("input-change-avatar");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      if (evt.target.files[0] != null) {
        document.getElementById("form-change-avatar").submit();
      }
    },
  },
});

function setTooltip() {
  console.log($('[data-toggle="tooltip"]'));
  $('[data-toggle="tooltip"]').tooltip();
}
