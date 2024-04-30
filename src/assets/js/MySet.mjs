// clase MySet 
class MySet {
    constructor(){this.set = new Set();}
    push=(value)=>this.set.add(value);
    getFirst=()=>(first => (this.set.delete(first), first))(this.set.values().next().value); 
    getLast=()=>(last => (this.set.delete(last), last))([...this.set].pop()); 
    length=()=>this.set.size;
  }
  export default MySet;