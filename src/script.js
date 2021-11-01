import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { sRGBEncoding } from 'three'
const canvas = document.querySelector('.webgl')

class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
        this.normalScene = new THREE.Scene()
        this.textColor = {
                color: 0xc948ff
            }
        this.InitEnv()
        this.InitText()
        this.InitCamera()
        this.InitLights()
        this.InitRenderer()
        this.InitBloom()
        this.InitControls()
        this.InitGUI()
        this.Update()
        window.addEventListener('resize', () => {
            this.Resize()
        })
    }

    InitGUI(){
        this.gui = new dat.GUI({ width: 400 })
        this.gui.add(this.unrealBloomPass, 'enabled')
        
        this.gui.add(this.unrealBloomPass, 'strength').min(0).max(2).step(0.001)
        this.gui.add(this.unrealBloomPass, 'radius').min(0).max(2).step(0.001)
        this.gui.add(this.unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
    }

    InitEnv(){
        this.wallGeometry = new THREE.PlaneGeometry(5, 5, 12, 12)
        this.wallMaterial = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            color: 0x000000
        })
        this.leftWall = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.rightWall = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.floor = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.roof = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.frontWall = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.backWall = new THREE.Mesh(this.wallGeometry, this.wallMaterial)
        this.scene.add(this.leftWall, this.rightWall, this.floor, this.roof, this.frontWall, this.backWall)

        this.leftWall.position.set(-2.5, 0, 0)
        this.leftWall.rotation.y = -Math.PI * 0.5
        this.rightWall.position.set(2.5, 0, 0)
        this.rightWall.rotation.y = Math.PI * 0.5
        this.floor.position.set(0, 2.5, 0)
        this.floor.rotation.x = -Math.PI * 0.5
        this.roof.position.set(0, -2.5, 0)
        this.roof.rotation.x = -Math.PI * 0.5
        this.frontWall.position.set(0, 0, 2.5)
        this.backWall.position.set(0, 0, -2.5)

    }

    InitBloom(){
        this.effectComposer = new EffectComposer(this.renderer)
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.effectComposer.setSize(window.innerWidth, window.innerHeight)

        this.renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(this.renderPass)

        this.unrealBloomPass = new UnrealBloomPass()
        this.effectComposer.addPass(this.unrealBloomPass)

        this.unrealBloomPass.strength = 1.7
        this.unrealBloomPass.radius = 0.5
        this.unrealBloomPass.threshold = 0.3
        

        
        
    }

    InitText(){
       
            this.textLoader = new THREE.FontLoader()
            
            this.textLoader.load(
            './Pacifico_Regular.json',
            (font) => {
                this.textParameters = {
                    font: font,
                    size: 0.5,
                    height: 0.4,
                    curveSegments: 2,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                }

                this.textGeometry = new THREE.TextGeometry(
                    'chill\nvibes', 
                    this.textParameters
                )
                this.textGeometry.computeBoundingBox()
                this.textGeometry.center()
                this.textMaterial = new THREE.MeshBasicMaterial({
                    color: this.textColor.color,
                    wireframe: true
                })
                this.textMaterial2 = new THREE.MeshBasicMaterial({
                    color: this.textColor.color,
                })
                this.gui.addColor(this.textColor, 'color').onChange(() => {
                    this.textMaterial.color = new THREE.Color(this.textColor.color)
                    this.textMaterial2.color = new THREE.Color(this.textColor.color)
                    }    
                )
                this.text = new THREE.Mesh(this.textGeometry, this.textMaterial)
                this.text2 = new THREE.Mesh(this.textGeometry, this.textMaterial2)
                this.scene.add(this.text)
                //this.scene.add(this.text2)
                this.text.position.set(0, 0, -2.5)
                this.text2.position.set(0, 0, -2.5)
                //this.textBackWall.rotation.x = -Math.PI
                this.text.castShadow = true

                
            }
        )
        

        
    }

    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100)
        this.camera.position.set(-0.25, 0, 1)
        this.normalCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100)
        this.normalCamera.position.set(0, 0, 2.5)
        this.scene.add(this.camera)
        this.normalScene.add(this.normalCamera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xba3eeb, 0.9)
        this.scene.add(this.ambientLight)
        this.pointLight = new THREE.PointLight(0xba3eeb, 25.0, 1000)
        this.scene.add(this.pointLight)
        this.pointLight.position.set(0, 0, 0)
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 0.2, 0xff0000)
        //this.scene.add(this.pointLightHelper)
    }
    
    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.outputEncoding = sRGBEncoding
        this.renderer.render(this.scene, this.normalCamera)    
    }

    InitControls(){
        this.controls = new OrbitControls(this.camera, canvas)
        this.newControls = new OrbitControls(this.normalCamera, canvas)
        this.controls.enableDamping = true
        this.controls.update()
        this.newControls.enableDamping = true
        this.newControls.update()
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.normalCamera.aspect = window.innerWidth / window.innerHeight
        this.normalCamera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    Update(){
        requestAnimationFrame(() => {
            
            this.effectComposer.render()
            //this.effectComposer.renderer.autoClearColor = false
           // this.renderer.autoClear = false
            //this.renderer.render(this.normalScene, this.normalCamera)
            
            //this.effectComposer.render()
            
            this.controls.update()
            this.newControls.update()
            this.Update()
        })  
    }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
    _APP = new NewScene()
})