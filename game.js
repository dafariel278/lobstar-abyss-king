let scene, camera, renderer;
let player;
let claws = [];
let legs = [];
let enemies = [];
let score = 0;
let hp = 100;
let clock = new THREE.Clock();
let running = false;
let attackMode = false;

function startGame(){
    document.getElementById("startScreen").style.display="none";
    document.getElementById("ui").style.display="block";
    init();
    running = true;
    animate();
}

function init(){

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 10, 60);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,5,10);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5,10,5);
    scene.add(light);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200,200),
        new THREE.MeshStandardMaterial({color:0x001122})
    );
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    createLobster();
    spawnEnemy();

    window.addEventListener("keydown", control);
}

function createLobster(){

    player = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8,1,3,16),
        new THREE.MeshStandardMaterial({color:0xaa0000})
    );
    body.rotation.z = Math.PI/2;
    player.add(body);

    // Claws
    for(let i=0;i<2;i++){
        const claw = new THREE.Mesh(
            new THREE.BoxGeometry(1.2,0.4,0.4),
            new THREE.MeshStandardMaterial({color:0xcc0000})
        );
        claw.position.set(1.5, i===0?0.5:-0.5,0);
        claws.push(claw);
        player.add(claw);
    }

    // Legs
    for(let i=0;i<6;i++){
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.1,0.6,0.1),
            new THREE.MeshStandardMaterial({color:0x990000})
        );
        leg.position.set(-0.5,0,(i-3)*0.5);
        legs.push(leg);
        player.add(leg);
    }

    player.position.y=1;
    scene.add(player);
}

function spawnEnemy(){
    const enemy = new THREE.Mesh(
        new THREE.SphereGeometry(0.7,16,16),
        new THREE.MeshStandardMaterial({color:0x00ffee})
    );
    enemy.position.set((Math.random()-0.5)*8,1,-40);
    scene.add(enemy);
    enemies.push(enemy);
}

function control(e){
    if(e.key==="ArrowLeft") player.position.x-=1;
    if(e.key==="ArrowRight") player.position.x+=1;
    if(e.key===" ") attackMode=true;
}

function animate(){
    requestAnimationFrame(animate);
    if(!running) return;

    let t = clock.getElapsedTime();

    // Animate legs
    legs.forEach((leg,i)=>{
        leg.rotation.x = Math.sin(t*5 + i)*0.5;
    });

    // Animate claws
    claws.forEach((claw,i)=>{
        if(attackMode){
            claw.rotation.z = (i===0?1:-1)*Math.sin(t*20)*1.2;
        } else {
            claw.rotation.z = 0;
        }
    });

    attackMode=false;

    // Enemy movement
    enemies.forEach((enemy,index)=>{
        enemy.position.z+=0.2;

        if(enemy.position.distanceTo(player.position)<2){
            hp-=5;
            document.getElementById("hp").innerText="HP: "+hp;
            enemy.position.z=-40;
        }

        if(enemy.position.z>5){
            enemy.position.z=-40;
        }

        if(attackMode && enemy.position.distanceTo(player.position)<4){
            scene.remove(enemy);
            enemies.splice(index,1);
            score+=10;
            document.getElementById("score").innerText="Score: "+score;
            spawnEnemy();
        }
    });

    if(hp<=0){
        running=false;
        document.getElementById("gameOver").style.display="flex";
    }

    camera.position.x = player.position.x;
    camera.lookAt(player.position);

    renderer.render(scene,camera);
}
