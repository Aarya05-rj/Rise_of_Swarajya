const supabase = require('c:/Rise_of_Maratha/backend/config/supabase.js');

async function testSubmit() {
  console.log('Fetching a valid user ID...');
  const { data, error } = await supabase.from('quiz_progress').select('user_id').limit(1);
  
  if (error || !data || data.length === 0) {
    console.log('Could not find a valid user ID to test with. Error:', error);
    return;
  }
  
  const userId = data[0].user_id;
  console.log('Testing with User ID:', userId);

  const payload = {
    userId,
    level: 1,
    quiz: 1,
    timeTaken: 120,
    answers: [
      { questionId: 1001, selectedAnswer: 0 },
      { questionId: 1002, selectedAnswer: 1 }
    ]
  };

  console.log('Sending submit-quiz request to backend...');
  const response = await fetch('http://localhost:5000/api/submit-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  console.log('Response status:', response.status);
  console.log('Response body:', JSON.stringify(json, null, 2));
}

testSubmit();
