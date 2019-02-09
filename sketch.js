let p; 
let timer;
let target;
let obstacle;

function setup(){
    createCanvas(500, 500);
    p = new Population();
    target = createVector(width/2, 50);
    obstacle = createVector(width/6, height/2);
    timer = 0;
}

function draw(){
    background(80);
    
    
    p.run();
    timer++;
    
    fill(255);
    ellipse(target.x, target.y, 20, 20);
    // rect(obstacle.x, obstacle.y, width*.65, 20);
    
    // for(let i = 0; i < p.popSize; i++){
    //     if(p.population[i].pos.x > obstacle.x && 
    //        p.population[i].pos.x < obstacle.x+(width* .65) && 
    //        p.population[i].pos.y > obstacle.y &&
    //        p.population[i].pos.y < obstacle.y+20){
    //         p.population[i].dead = true;
    //     }
    // }
    
    if(timer == 500){
        p.evaluate();
        p = p.naturalSelection();
        timer = 0;
    }
}


///// Begining of the Population Class /////

class Population{
    constructor(population){
        this.matingpool = [];
        this.popSize = 100;
        if(population){
            this.population = population;
        }else{
            this.population = [];
            for(let i = 0; i < this.popSize; i++){
                this.population[i] = new Rocket();
            }
        }
    }
    
    calcFitness(){
        for(let i = 0; i < this.popSize; i++){
            this.population[i].calcFitness();
        }
    }
    
    evaluate(){
        this.calcFitness();
        
        let maxFitness = 0;
        for(let i = 0; i < this.popSize; i++){
            if(this.population[i].fitness > maxFitness){
                maxFitness = this.population[i].fitness;
            }
        }
        
        console.log(maxFitness);
        
        this.matingpool = [];
        for(let i = 0; i < this.popSize; i++){
            this.population[i].fitness /= maxFitness;
            let count = this.population[i].fitness * 100;
            for(let j = 0; j < count; j++){
                this.matingpool.push(this.population[i])
            }
        }
    }
    
    naturalSelection(){
        let newPopulation = [];
        
        for(let i = 0; i < this.popSize; i++){
            let partnerA = random(this.matingpool);
            let partnerB = random(this.matingpool);
            
            let child = partnerA.crossover(partnerB);
            let newRocket = new Rocket();
            newRocket.brain = child;
            newPopulation.push(newRocket);
        }
        return new Population(newPopulation);
    }
    
    run(){
        for(let i = 0; i < this.popSize; i++){
            if(this.population[i].pos.x < 0 || this.population[i].pos.x > width ||          this.population[i].pos.y < 0 || this.population[i].pos.y > height){
                this.population[i].dead = true;
            }
        }
        
        for(let i = 0; i < this.popSize; i++){
            this.population[i].update();
            this.population[i].show();
            
            let d = dist(this.population[i].pos.x, this.population[i].pos.y, target.x, target.y);
            
            // if(this.population[i].pos.x > obstacle.x && 
            //    this.population[i].x < obstacle.x + (width*.65) && 
            //    this.population[i].y < obstacle.y && 
            //    this.population[i].y  < obstacle.y + 20){
            //     this.population[i].dead = true;
            //     console.log("DEAD")
                
            // }
            
            if(d < 10){
                this.population[i].pos = target;
                this.population[i].dead = true;
            }
        }
    }
}

////// Begining of the Rocket Class ////

class Rocket{
    constructor(){
        this.pos = createVector(width/2, height-30);
        this.vel = createVector();
        this.acc = createVector();
        this.brain = new Gene();
        this.dead = false;
        this.fitness = 0;
        this.count = 0;
    }
    
    applyForce(force){
        this.acc.add(force);
    }
    
    show(){
        noStroke();
        fill(240, 180);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rect(0, 0, 30, 7);
        pop();
    }
    
    update(){
        if(!this.dead){
            this.applyForce(this.brain.genes[this.count])
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);
            this.count++;
        }
    }
    
    calcFitness(){
        const d = dist(target.x, target.y, this.pos.x, this.pos.y);
        this.fitness = 1/d;
        
        if(d < 10){
            this.fitness *= 10;
            
            this.fitness *= (200/this.count)*0.4;
        }
        if(this.fitness == Infinity){
            this.fitness = 1;
        }
    }
    
    crossover(otherParent){
        const range = this.brain.geneSize;
        const mid = floor(random(0, range));
        let child = new Gene();
        for(let i = 0; i < range; i++){
            if(i < mid){
                child.genes[i] = this.brain.genes[i];
            }else{
                child.genes[i] = otherParent.brain.genes[i];
            }
        }
    
        return child;
    }
    
    mutate(){
        const index = floor(random(geneSize));
        const prob = random(1);
        
        if(prob < 0.1){
            this.brain.genes[index] = p5.Vector.random2D().setMag(0.2);
        }
    }
}


///// The Begining of the Gene Class ////////

class Gene{
    constructor(){
        this.genes = [];
        this.geneSize = 300;
        
        for(let i = 0; i < this.geneSize; i++){
            this.genes[i] = p5.Vector.random2D().setMag(0.2);
        }
    }
}