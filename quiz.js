document.getElementById('quizForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let score = 0;
    const totalQuestions = 4;
    const passingScore = 3; // Minimum score required to pass
    
    // Ask for user's name
    let userName = prompt("Enter your name for the certificate:");
  
    if (!userName || userName.trim() === "") {
      alert("You must enter your name to proceed.");
      return;
    }
  
    // Check the answers
    const q1Answer = document.querySelector('input[name="q1"]:checked')?.value;
    const q2Answer = document.querySelector('input[name="q2"]:checked')?.value;
    const q3Answer = document.querySelector('input[name="q3"]:checked')?.value;
    const q4Answer = document.querySelector('input[name="q4"]:checked')?.value;
  
    // Correct answers
    const correctAnswers = {
      q1: 'alt', // Correct answer for the image attribute question
      q2: 'Tim Berners-Lee', // Correct answer for the father of HTML question
      q3: 'HyperText Markup Language',
      q4: '<!doctype html>'
    };
    
    if (q1Answer === correctAnswers.q1) score++;
    if (q2Answer === correctAnswers.q2) score++;
    if (q3Answer === correctAnswers.q3) score++;
    if (q4Answer === correctAnswers.q4) score++;
  
    // Check if the user passed or failed
    if (score >= passingScore) {
      localStorage.setItem("userName", userName);
      localStorage.setItem("userScore", score);
      localStorage.setItem("totalQuestions", totalQuestions);
      
      // Redirect to the certificate page
      window.location.href = "certificate.html";
    } else {
      document.getElementById('result').innerHTML = 
        `You scored ${score} out of ${totalQuestions}. <span style='color: red; font-weight: bold;'>You Failed!</span>`;
    }
  });
  