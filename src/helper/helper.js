function separate(token){
    let spaceIndex;
    for(let i = 0; i < token.length; i++){
      if(token[i] === ' '){
        spaceIndex = i;
      }
    }
  
    let allToken = ''
    for(let i = 0; i < spaceIndex; i++){
      allToken += token[i]
    }
    return parseInt(token);
  }

  module.exports = [separate]