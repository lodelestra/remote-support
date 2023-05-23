var count = 0
var element = document.querySelector('.alert-button')
element.addEventListener('click', function(event) {
  count = count + 1
  console.log("click event:", event)
  element.innerHTML = "clicked" + count
});

