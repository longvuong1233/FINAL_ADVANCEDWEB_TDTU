//Tạo socket để nhận sự kiện từ server
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
      //Mở của sổ load ảnh từ máy
      let inputImage = document.getElementById("form-images");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      // Lấy ảnh gửi
      if (evt.target.files[0] != null) {
        this.images = evt.target.files;
      }
    },
    async emitPost() {
      //Gửi thông tin bài viết mới lên server
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
  el: ".list-post",
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
    // gọi hàm fetchPost để lấy bài viêt

    const listPost = await this.fetchPost();

    this.listPost = listPost;

   
  
  
    window.addEventListener("scroll", this.handleScroll);
  },

  updated() {
    setTooltip();
  },
  watch: {
    async isEnd(value) {
      if (value == true) {
        const listPost = await this.fetchPost();
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
      // Lấy bài viết từ server
      const idUser = window.location.search.split("=").slice(-1)[0];

      let listPost = [];
      if (!idUser) {
        listPost = await axios.get("/post", {
          params: {
            turn: this.turn,
          },
        });
      } else {
        console.log("!1");
        listPost = await axios.get("/post", {
          params: {
            idUser: idUser,
            turn: this.turn,
          },
        });
      }

      return [...listPost.data];
    },
    handleScroll(e) {
      $(document).ready(() => {
        // xử lý bắt sự kiện lăn cuối trang để gọi bài viết mới
        let position = $(window).scrollTop();

        let limitScroll = $(document).height() - $(window).height();

        if (position >= limitScroll - 180) {
          this.isEnd = true;
        }
      });
    },
    openComment(idPost) {
      // Bật mở ổ comment bài viêt
      let state = document.getElementById("comment-area" + idPost).style
        .display;

      document.getElementById("comment-area" + idPost).style.display =
        state == "" || state == "none" ? "block" : "none";
    },

    comment(idPost, idUser, indexPost) {
      // Comment bài viết
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
      // Xóa Comment
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
      // Thả tim bài viêt
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
      // KIểm tra xem đã thả tim bài viết chưa
      const indexUser = this.listPost[indexPost].heart.indexOf(idUser);
      return indexUser != -1 ? true : false;
    },

    openEditPost(indexPost, idPost) {
      // Mở cửa sổ edit bài viêt
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
      // mở  cửa sổ lấy ảnh từ máy
      let inputImage = document.getElementById("form-images-edit");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      // Lấy file ảnh để gửi lên server
      if (evt.target.files[0] != null) {
        this.imagesEdit = evt.target.files;
      }
    },
    async emitPost() {
      // Gửi thông tin chỉnh sửa bài viết để gửi lên server
      let iframeYoutube = "";

      if (this.youtubeEdit.trim() != "") {
        let url = new URL(this.youtubeEdit.trim());
        let v = url.searchParams.get("v");
        iframeYoutube = "https://www.youtube.com/embed/" + v;
      }

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
      // Xóa bài viêt
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
    // Lấy 5 thông báo phòng ban mới nhất
    // GỌi API
    const listNewestInform = await axios.get("/inform/api");

    this.listInform = listNewestInform.data;

    //Lắng nghe sự kiện socket có thông báo mới
    socket.on("haveNewInform", (signal) => {
      if (signal == "ok") {
        // Gọi hàm fetchInform để lấy thông báo mới
        this.fetchInform();
      }
    });
  },
  methods: {
    async fetchInform() {
      // Gọi API để lấy thông báo mới
      const listNewestInform = await axios.get("/inform/api");

      this.listInform = listNewestInform.data;
    },
    briefText(text, count) {
      // RÚt gọn text
      return text.substring(0, count) + "...";
    },
    convertTime(time) {
      // Tính thời gian
      // Vừa xong, 1 phút trước
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
  el: "#user-infor-1",
  methods: {
    changeAvatar() {
      // mở cửa sổ lấy avatar từ mays
      let inputImage = document.getElementById("input-change-avatar");
      inputImage.click();
      inputImage.addEventListener("change", this.gotImages, false);
    },
    gotImages(evt) {
      // Gửi avatar lên server
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
