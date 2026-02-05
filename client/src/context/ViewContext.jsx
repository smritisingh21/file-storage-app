
function Student(name, age) {
  this.name = name;
  this.age = age;
}

// Adding method using prototype
Student.prototype.display = function () {
  console.log("Name:", this.name);
};

//using _ _proto_ _

let s1 = new Student("Navin", 20);
s1.display();
let person = {
  greet() {
    console.log("Hello");
  }
};
let student = {
  name: "Navin"
};

student.__proto__ = person;
student.greet(); 

//class and objects
class Student {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  display() {
    console.log(this.name, this.age);
  }
}

let obj = new Student("Navin", 20);
obj.display();

//intialisation without constructor
class Student {
  name;
  age;
}

let s11 = new Student();
s11.name = "Navin";
s12.age = 20;

console.log(s11);

//initalisation with constructor
class Student {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}


let s12 = new Student("Rahul", 22);
console.log(s12);

//single -level inheritance
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log("Hello", this.name);
  }
}

class Student extends Person {
  study() {
    console.log(this.name, "is studying");
  }
}

let stu = new Student("Navin");
stu.greet();
stu.study();



//heirarchical inheritnace
class Person {
  constructor(name) {
    this.name = name;
  }
}

class Student extends Person {
  learn() {
    console.log(this.name, "is learning");
  }
}

class Teacher extends Person {
  teach() {
    console.log(this.name, "is teaching");
  }
}

let s = new Student("Navin");
let t = new Teacher("Kumar");

s.learn();
t.teach();

//method overriding
class Person {
  speak() {
    console.log("Person speaks");
  }
}

class Student extends Person {
  speak() {
    console.log("Student speaks");
  }
}

let ob = new Student();
ob.speak();


//super keyword
class Person {
  constructor(name) {
    this.name = name;
  }
}

class Student extends Person {
  constructor(name, age) {
    super(name); // Calls parent constructor
    this.age = age;
  }

  display() {
    console.log(this.name, this.age);
  }
}

let student = new Student("Navin", 20);
student.display();


//calling parent method
class Person {
  greet() {
    console.log("Hello from Person");
  }
}

class Student extends Person {
  greet() {
    super.greet();
    console.log("Hello from Student");
  }
}

let std = new Student();
std.greet();
