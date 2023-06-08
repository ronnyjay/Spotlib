function titlebarSetter() {
  const titlebar = document.getElementById("titlebar-container");
  titlebar.children[1].src = "../../assets/images/icons/min_t.png";
  titlebar.children[2].src = "../../assets/images/icons/exit_t.png";
}

function titlebarDefault() {
  const titlebar = document.getElementById("titlebar-container");
  titlebar.children[1].src = "../../assets/images/icons/min_st.png";
  titlebar.children[2].src = "../../assets/images/icons/exit_st.png";
}
