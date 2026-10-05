import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import { ArrowUpRight, BadgeCheck, Box, Truck } from 'lucide-react'

const machineNames = ['Master', 'Sintese', 'Artist']
const whatsappUrl = `https://wa.me/5532999733253?text=${encodeURIComponent('Olá! Quero conhecer o Syncro MOV e ver uma demonstração para minha fábrica.')}`

// Cria um material padrão do Three.js com aparência metálica configurável.
function makeMaterial(color, metalness = 0.1, roughness = 0.65, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })
}

// Atalho para criar uma caixa, posicioná-la dentro de um grupo e habilitar sombras.
// Os vetores size e position usam a ordem dos eixos X, Y e Z.
function addBox(parent, size, position, material, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...position)
  mesh.castShadow = castShadow
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

// Desenha uma textura de texto em canvas para usar como placa, tela ou logotipo.
function makeLabelTexture(title, subtitle) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.fillStyle = '#f7f9fb'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#e36b2c'
  context.fillRect(24, 26, 4, 76)
  context.font = '700 32px Arial, sans-serif'
  context.fillStyle = '#111111'
  context.fillText(title.toUpperCase(), 48, 65)
  context.font = '16px monospace'
  context.fillStyle = '#0056a8'
  context.fillText(subtitle.toUpperCase(), 49, 93)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Monta uma célula CNC completa. Os grupos organizam peças fixas e móveis.
function createCncCell(scene, name, x, materials) {
  // Grupo raiz da máquina: posição na fábrica e nome usado para seleção por clique.
  const root = new THREE.Group()
  root.position.set(x, 0, -1.2)
  root.userData.machineName = name
  scene.add(root)

  // Base inferior e tampo estrutural fixo que sustentam as duas mesas.
  addBox(root, [6.2, 0.42, 5.25], [0, 0.3, 0], materials.base)
  addBox(root, [5.85, 0.16, 4.95], [0, 0.58, 0], materials.frame)

  // Pés de nivelamento na base da máquina
  for (const footX of [-2.9, 2.9]) {
    for (const footZ of [-2.45, 2.45]) {
      const footPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 16), materials.steel)
      footPlate.position.set(footX, 0.02, footZ)
      root.add(footPlate)
      const footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), materials.base)
      footPad.position.set(footX, -0.01, footZ)
      root.add(footPad)
    }
  }

  // Duas mesas de trabalho independentes - uma deslocada para frente, outra para trás
  const tables = []
  const tableConfigs = [
    { tableX: -1.47, zOffset: -0.9, index: 0 },
    { tableX: 1.47, zOffset: 0.9, index: 1 },
  ]
  tableConfigs.forEach(({ tableX, zOffset, index }) => {
    const table = new THREE.Group()
    table.position.set(tableX, 0, zOffset)
    table.userData.slidePhase = index * Math.PI
    root.add(table)
    // Estrutura de base da mesa com formato chanfrado (igual na imagem - base mais angulada)
    addBox(root, [2.82, 0.22, 4.55], [tableX, 0.68, zOffset], materials.base)
    addBox(root, [2.4, 0.55, 0.9], [tableX, 1.0, zOffset - 1.75], materials.frame)
    addBox(root, [2.4, 0.55, 0.9], [tableX, 1.0, zOffset + 1.75], materials.frame)
    addBox(root, [1.0, 0.8, 4.2], [tableX, 0.85, zOffset], materials.frame)
    // Chanfros dianteiros da base
    addBox(root, [0.3, 0.5, 0.9], [tableX - 1.0, 0.9, zOffset - 1.75], materials.frame)
    addBox(root, [0.3, 0.5, 0.9], [tableX + 1.0, 0.9, zOffset - 1.75], materials.frame)
    addBox(root, [0.3, 0.5, 0.9], [tableX - 1.0, 0.9, zOffset + 1.75], materials.frame)
    addBox(root, [0.3, 0.5, 0.9], [tableX + 1.0, 0.9, zOffset + 1.75], materials.frame)
    // Pés da base da mesa (4 por mesa)
    for (const footX of [-1.35, 1.35]) {
      for (const footZ of [-2.1, 2.1]) {
        const tableFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 12), materials.steel)
        tableFoot.position.set(tableX + footX, 0.47, zOffset + footZ)
        root.add(tableFoot)
        const tableFootPad = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), materials.base)
        tableFootPad.position.set(tableX + footX, 0.32, zOffset + footZ)
        root.add(tableFootPad)
      }
    }
    // Tampo da mesa com estrutura metálica
    addBox(table, [2.72, 0.34, 4.35], [0, 0.92, 0], materials.frame)
    // Trilhos guia laterais
    for (const railX of [-1.25, 1.25]) {
      addBox(table, [0.1, 0.08, 4.12], [railX, 1.14, 0], materials.steel, false)
    }
    // Perfil de alumínio da borda frontal/traseira
    addBox(table, [2.52, 0.08, 0.1], [0, 1.1, -2.05], materials.steel, false)
    addBox(table, [2.52, 0.08, 0.1], [0, 1.1, 2.05], materials.steel, false)
    // Madeira a usinar, ranhuras decorativas e grampos de fixação nos cantos.
    const workpiece = addBox(table, [2.38, 0.14, 3.72], [0, 1.18, 0], materials.woodLight)
    workpiece.userData.machineName = name
    // Textura de grelha/vácuo (linhas finas na madeira)
    for (let grooveI = 0; grooveI < 18; grooveI += 1) {
      const grooveZ = -1.75 + grooveI * 0.2
      addBox(table, [2.2, 0.008, 0.01], [0, 1.252, grooveZ], materials.cutGroove, false)
    }
    for (const clampX of [-1.18, 1.18]) {
      for (const clampZ of [-1.7, 1.7]) {
        addBox(table, [0.16, 0.12, 0.18], [clampX, 1.25, clampZ], materials.machine, false)
      }
    }
    // Corrente porta-cabos embaixo da mesa móvel (lado de fora, como na imagem real)
    const tableChainCurveStart = new THREE.Vector3(tableX - 1.2, 0.92, zOffset - 1.9)
    const tableChainCurve = new THREE.QuadraticBezierCurve3(
      tableChainCurveStart,
      new THREE.Vector3(tableX - 0.2, 1.3, zOffset - 0.8),
      new THREE.Vector3(tableX, 1.0, zOffset - 0.2),
    )
    tableChainCurve.v0 = tableChainCurveStart
    const tableChainLinks = Array.from({ length: 20 }, (_, linkIdx) => {
      const link = addBox(root, [0.13, 0.09, 0.18], [tableX, 0.92, zOffset], linkIdx % 2 ? materials.chainLink : materials.chainLinkAlt, false)
      link.visible = false
      return link
    })
    table.userData.chain = { curve: tableChainCurve, links: tableChainLinks }
    tables.push(table)
  })

  // Colunas laterais em formato de A (base larga, topo estreito)
  for (const side of [-1, 1]) {
    // Pé inferior reforçado alargado
    addBox(root, [2.0, 0.28, 2.0], [side * 2.5, 0.75, 0.1], materials.base)
    // Pé inclinado para fora na base (formato de pé da coluna como na imagem)
    addBox(root, [1.2, 0.5, 1.4], [side * 2.65, 1.05, 0.05], materials.frame)
    // Corpo da coluna em formato A (três camadas convergentes)
    addBox(root, [1.15, 1.3, 1.1], [side * 2.78, 1.95, -0.02], materials.frame)
    addBox(root, [0.95, 1.5, 1.0], [side * 2.82, 3.35, -0.04], materials.frame)
    addBox(root, [0.78, 2.2, 0.9], [side * 2.85, 5.2, -0.06], materials.frame)
    // Topo da coluna alinhado com a travessa
    addBox(root, [0.82, 0.38, 1.02], [side * 2.85, 6.45, -0.08], materials.frame)
    // Guias verticais finas na face interna
    addBox(root, [0.1, 3.4, 0.12], [side * 2.52, 3.8, 0.35], materials.steel, false)
    addBox(root, [0.1, 3.4, 0.12], [side * 2.52, 3.8, -0.35], materials.steel, false)
    // Placa de sinalização nas colunas
    const sideLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.14),
      new THREE.MeshBasicMaterial({ map: makeLabelTexture('-X+', 'GUIA'), toneMapped: false, transparent: true }),
    )
    sideLabel.position.set(side * 2.46, 4.8, 0.02)
    sideLabel.rotation.y = side * Math.PI / 2
    root.add(sideLabel)
    // Adesivos coloridos na coluna direita (adesivo colorido igual na foto)
    if (side > 0) {
      addBox(root, [0.02, 0.12, 0.12], [side * 2.47, 4.6, 0.02], materials.buttonGreen, false)
      addBox(root, [0.02, 0.06, 0.08], [side * 2.47, 4.42, 0.02], makeMaterial('#0056a8', 0.3, 0.4), false)
      addBox(root, [0.02, 0.06, 0.08], [side * 2.47, 4.32, 0.02], makeMaterial('#d62828', 0.3, 0.4), false)
    }
  }

  // Pórtico transversal fixo, com perfil robusto
  const gantry = new THREE.Group()
  root.add(gantry)
  // Viga principal branca única espessa
  addBox(gantry, [6.55, 1.35, 1.15], [0, 6.38, -0.08], materials.frame)
  // Perfis metálicos frontais da viga (trilhos)
  addBox(gantry, [5.9, 0.18, 0.2], [0, 5.86, 0.54], materials.steel)
  addBox(gantry, [5.9, 0.18, 0.2], [0, 6.92, 0.54], materials.steel)
  // Fila de furos/parafusos na face superior e inferior
  for (let holeI = 0; holeI < 16; holeI += 1) {
    const holeX = -2.85 + holeI * 0.38
    const holeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 8), materials.machine)
    holeTop.position.set(holeX, 7.05, -0.08)
    gantry.add(holeTop)
    const holeBot = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 8), materials.machine)
    holeBot.position.set(holeX, 5.72, -0.08)
    gantry.add(holeBot)
  }
  addBox(gantry, [5.28, 0.14, 0.14], [0, 5.78, 0.54], materials.machine, false)
  // Suporte do ponto de fixação da corrente no lado esquerdo do topo
  addBox(gantry, [0.38, 0.18, 0.3], [-2.82, 6.95, 0.66], materials.machine, false)

  // === TORRE SUPERIOR (acima do pórtico) com colunas, carretel de cabos e carenagem AZUL ===
  // Duas colunas/pistões verticais grossas acima da travessa
  const upperTower = new THREE.Group()
  upperTower.position.set(0, 6.38, -0.35)
  gantry.add(upperTower)
  // Coluna esquerda
  addBox(upperTower, [0.38, 2.1, 0.42], [-0.72, 1.05, 0.15], materials.frame)
  addBox(upperTower, [0.22, 0.14, 0.3], [-0.72, 2.15, 0.3], materials.steel)
  addBox(upperTower, [0.22, 0.14, 0.3], [-0.72, 0.05, 0.3], materials.steel)
  // Coluna direita
  addBox(upperTower, [0.38, 2.1, 0.42], [0.72, 1.05, 0.15], materials.frame)
  addBox(upperTower, [0.22, 0.14, 0.3], [0.72, 2.15, 0.3], materials.steel)
  addBox(upperTower, [0.22, 0.14, 0.3], [0.72, 0.05, 0.3], materials.steel)
  // Carretel/duto de cabos coloridos entre as duas colunas (bobinas como na foto)
  const cableReel = new THREE.Group()
  cableReel.position.set(0, 1.35, 0.05)
  upperTower.add(cableReel)
  for (let reelI = 0; reelI < 4; reelI += 1) {
    const reelColors = [
      materials.buttonGreen,
      materials.cab,
      makeMaterial('#f4c430', 0.3, 0.5),
      makeMaterial('#d62828', 0.3, 0.5),
    ]
    const cableRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36 - reelI * 0.06, 0.035, 6, 28),
      reelColors[reelI],
    )
    cableRing.rotation.y = Math.PI / 2
    cableRing.rotation.z = reelI * 0.08
    cableReel.add(cableRing)
  }
  // Carenagem AZUL na parte de trás do conjunto superior (igual a foto)
  const blueHousing = new THREE.Group()
  blueHousing.position.set(0, 1.35, -0.35)
  upperTower.add(blueHousing)
  // Formato trapezoidal da carenagem azul (característico da máquina Bacci)
  addBox(blueHousing, [1.35, 0.18, 0.55], [0, -0.62, 0], materials.machine)
  addBox(blueHousing, [1.22, 0.3, 0.5], [0, -0.38, 0], materials.machine)
  addBox(blueHousing, [1.08, 0.4, 0.45], [0, -0.04, 0], materials.machine)
  addBox(blueHousing, [0.92, 0.4, 0.4], [0, 0.3, 0], materials.machine)
  addBox(blueHousing, [0.76, 0.38, 0.35], [0, 0.64, 0], materials.machine)
  addBox(blueHousing, [0.58, 0.22, 0.28], [0, 0.92, 0], materials.machine)
  // Aletas de refrigeração na face traseira azul
  for (let finI = 0; finI < 5; finI += 1) {
    const finY = -0.55 + finI * 0.32
    addBox(blueHousing, [0.8, 0.025, 0.03], [0, finY, -0.28], materials.steel, false)
  }
  // Parafusos nas laterais da carenagem azul
  for (const side of [-1, 1]) {
    for (let boltI = 0; boltI < 3; boltI += 1) {
      const boltY = -0.45 + boltI * 0.55
      const mBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 10), materials.bit)
      mBolt.rotation.y = Math.PI / 2
      mBolt.position.set(side * 0.55, boltY, -0.05)
      blueHousing.add(mBolt)
    }
  }
  // Placa de texto/site na face frontal da carenagem azul
  const brandPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.14),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture('SYNCRO MOV', 'PRECISION CNC'), toneMapped: false }),
  )
  brandPlate.position.set(0, -0.55, 0.28)
  brandPlate.rotation.x = -0.08
  blueHousing.add(brandPlate)

  // Carro móvel que percorre o pórtico no eixo X.
  const carriage = new THREE.Group()
  carriage.position.set(0, 6.38, 1.05)
  gantry.add(carriage)
  addBox(carriage, [1.65, 1.35, 0.32], [0, 0, 0.02], materials.frame)
  addBox(carriage, [1.4, 0.14, 0.12], [0, 0.56, 0.25], materials.steel, false)
  addBox(carriage, [1.0, 0.14, 0.1], [0, -0.56, 0.25], materials.steel, false)
  for (const guideX of [-0.65, 0.65]) {
    addBox(carriage, [0.14, 0.16, 4.1], [guideX, 0, -0.7], materials.steel, false)
  }
  // Placa de logotipo no carro (como na imagem, indicador com engrenagem)
  const logoPlate = addBox(carriage, [0.52, 0.4, 0.06], [0, 0.35, 0.2], materials.frame)
  logoPlate.userData.machineName = name
  const logoRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 22), materials.machine)
  logoRing.rotation.y = 0
  logoRing.position.set(-0.13, 0.35, 0.24)
  carriage.add(logoRing)
  // Placa de texto no carro
  const carriageLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.12),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(name, ''), toneMapped: false, transparent: true }),
  )
  carriageLabel.position.set(0.07, 0.36, 0.242)
  carriage.add(carriageLabel)

  // Cabeçote/estágio VERTICAL Z - fino e alongado, todo branco como na foto real (mais para frente)
  const headStage = new THREE.Group()
  headStage.position.set(0, 0, 0.3)
  carriage.add(headStage)
  // Placa traseira de fixação no carro
  addBox(headStage, [1.18, 0.6, 0.22], [0, 0, -0.1], materials.machine)
  // Estrutura principal branca FINA e LONGA (desce em direção à peça)
  addBox(headStage, [0.58, 2.9, 0.42], [0, -1.42, 0.08], materials.frame)
  // Pequenos suportes de conexão superior
  addBox(headStage, [0.46, 0.3, 0.36], [0, 0.1, 0.08], materials.steel)
  // Guias lineares finas nas laterais da coluna Z
  for (const side of [-1, 1]) {
    addBox(headStage, [0.07, 2.7, 0.08], [side * 0.24, -1.4, 0.28], materials.steel, false)
  }
  // Suportes de fixação do eixo C na frente
  for (const guideX of [-0.45, 0.45]) {
    addBox(headStage, [0.22, 0.22, 0.38], [guideX, -0.1, 0.1], materials.steel)
  }
  // Placa com indicador de eixo -C+ na face frontal (branca com detalhes)
  addBox(headStage, [0.58, 0.42, 0.06], [0, -0.02, 0.3], materials.frame)
  const cAxisIndicator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32),
    materials.machine,
  )
  cAxisIndicator.rotation.x = Math.PI / 2
  cAxisIndicator.position.set(0, -0.02, 0.34)
  headStage.add(cAxisIndicator)
  const cAxisLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.08),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture('-C+', 'EIXO Z'), toneMapped: false }),
  )
  cAxisLabel.position.set(0, -0.02, 0.372)
  headStage.add(cAxisLabel)
  // Parafusos visíveis na face
  for (const side of [-1, 1]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.045, 12), materials.bit)
    bolt.rotation.x = Math.PI / 2
    bolt.position.set(side * 0.22, -0.02, 0.335)
    headStage.add(bolt)
  }

  // Caminho curvo da corrente porta-cabos superior (ao longo da viga)
  const dragChainCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.82, 6.95, 0.66),
    new THREE.Vector3(-1.4, 7.5, 0.4),
    new THREE.Vector3(0, 6.6, 0),
  )
  const dragChainLinks = Array.from({ length: 38 }, (_, index) => {
    const link = addBox(gantry, [0.15, 0.11, 0.2], [-2.82, 6.95, 0.66], index % 2 ? materials.chainLink : materials.chainLinkAlt, false)
    link.visible = false
    return link
  })

  // === CONJUNTO DO EIXO C (CABEÇOTE DE USINAGEM) - PONTA INFERIOR ===
  // Corpo arredondado/inclinado branco que segura a fresa e serra (igual a foto)
  const cAxis = new THREE.Group()
  cAxis.position.set(0, -2.55, 0.0)
  headStage.add(cAxis)
  // Topo inclinado (junção com a coluna Z) - aumentado para cima
  addBox(cAxis, [0.56, 0.42, 0.48], [0, 0.2, 0.02], materials.frame)
  // Corpo principal da ponta - MAIS LARGO e MAIS ALTO
  addBox(cAxis, [0.72, 0.92, 0.56], [0, -0.4, 0.02], materials.frame)
  // Parte inferior mais estreita onde acoplam as ferramentas
  addBox(cAxis, [0.48, 0.34, 0.46], [0, -0.98, 0.02], materials.frame)
  // Detalhe de placa preta na base onde sai a fresa
  addBox(cAxis, [0.36, 0.1, 0.36], [0, -1.18, 0.06], materials.chainLink)
  // Placa cinza na lateral esquerda
  addBox(cAxis, [0.08, 0.52, 0.38], [-0.32, -0.5, 0.08], materials.steel)
  // Chanfros decorativos nas bordas frontais
  addBox(cAxis, [0.04, 0.8, 0.5], [-0.38, -0.4, 0.02], materials.steel, false)
  addBox(cAxis, [0.04, 0.8, 0.5], [0.38, -0.4, 0.02], materials.steel, false)

  // MANDRIL E FRESA CENTRAL (sai da parte de baixo na vertical) - fresa reduzida na metade
  const collet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.28, 22), materials.steel)
  collet.position.set(0, -1.32, 0.18)
  collet.userData.machineName = name
  cAxis.add(collet)
  const colletNut = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.08, 18), materials.bit)
  colletNut.position.set(0, -1.48, 0.18)
  cAxis.add(colletNut)
  const drillRotor = new THREE.Group()
  drillRotor.position.set(0, -1.54, 0.18)
  cAxis.add(drillRotor)
  const cutterShank = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.15, 12), materials.bit)
  cutterShank.position.set(0, -0.08, 0)
  drillRotor.add(cutterShank)
  const bit = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.012, 0.17, 12), materials.bit)
  bit.position.set(0, -0.24, 0)
  drillRotor.add(bit)
  bit.userData.machineName = name

  // DISCO DE SERRA na LATERAL ESQUERDA (como na foto real - lado esquerdo da ponta)
  const sideSawMount = addBox(cAxis, [0.26, 0.38, 0.3], [-0.44, -0.9, 0.08], materials.machine)
  sideSawMount.userData.machineName = name
  const sideSaw = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.055, 36), materials.bit)
  sideSaw.rotation.x = Math.PI / 2
  sideSaw.position.set(-0.44, -1.22, 0.22)
  sideSaw.castShadow = true
  sideSaw.userData.machineName = name
  cAxis.add(sideSaw)
  const sideSawHub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 20), materials.steel)
  sideSawHub.rotation.x = Math.PI / 2
  sideSawHub.position.set(-0.44, -1.22, 0.265)
  cAxis.add(sideSawHub)

  // Torre de troca de ferramentas (tool changer) - lado esquerdo, como na foto
  const toolChanger = new THREE.Group()
  toolChanger.position.set(-4.1, 0, 0.1)
  root.add(toolChanger)
  // Coluna de trás do tool changer
  addBox(toolChanger, [0.35, 4.6, 0.8], [-0.25, 2.3, -0.05], materials.frame)
  addBox(toolChanger, [0.85, 0.3, 1.1], [0.0, 0.15, 0.0], materials.base)
  // Gabinete inferior fechado
  addBox(toolChanger, [0.8, 1.6, 1.0], [0.0, 1.1, 0.0], materials.frame)
  // Carcaça superior aberta
  addBox(toolChanger, [0.65, 0.4, 0.95], [0.05, 2.85, 0.0], materials.machine)
  // Modulo eletrônico preto no topo do tool changer
  addBox(toolChanger, [0.3, 0.45, 0.28], [0.1, 3.3, -0.05], materials.chainLink)
  // Carrossel superior de ferramentas
  const carouselTop = new THREE.Group()
  carouselTop.position.set(0.1, 2.5, 0.42)
  toolChanger.add(carouselTop)
  for (let toolI = 0; toolI < 4; toolI += 1) {
    const angle = (toolI / 4) * Math.PI * 0.65 - Math.PI * 0.32
    const toolHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.11, 12), materials.steel)
    toolHolder.position.set(Math.cos(angle) * 0.28, -Math.sin(angle) * 0.1, Math.sin(angle) * 0.28)
    toolHolder.rotation.z = angle
    carouselTop.add(toolHolder)
    const toolBit = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.22, 10), materials.bit)
    toolBit.position.copy(toolHolder.position)
    toolBit.position.y -= 0.15
    toolBit.rotation.z = angle
    carouselTop.add(toolBit)
  }
  // Carrossel inferior de ferramentas
  const carouselBot = new THREE.Group()
  carouselBot.position.set(0.1, 1.7, 0.42)
  toolChanger.add(carouselBot)
  for (let toolI = 0; toolI < 4; toolI += 1) {
    const angle = (toolI / 4) * Math.PI * 0.65 - Math.PI * 0.32
    const toolHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.11, 12), materials.steel)
    toolHolder.position.set(Math.cos(angle) * 0.28, -Math.sin(angle) * 0.1, Math.sin(angle) * 0.28)
    toolHolder.rotation.z = angle
    carouselBot.add(toolHolder)
    const toolBit = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.22, 10), materials.bit)
    toolBit.position.copy(toolHolder.position)
    toolBit.position.y -= 0.14
    toolBit.rotation.z = angle
    carouselBot.add(toolBit)
  }
  // Botão de emergência vermelho no tool changer
  const eStopBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.035, 14), materials.steel)
  eStopBase.position.set(0.38, 2.95, 0.52)
  eStopBase.rotation.y = -Math.PI / 2
  toolChanger.add(eStopBase)
  const eStop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.048, 0.05, 14),
    makeMaterial('#d62828', 0.3, 0.4, { emissive: '#8b0000', emissiveIntensity: 0.45 }),
  )
  eStop.position.set(0.38, 2.95, 0.55)
  eStop.rotation.y = -Math.PI / 2
  toolChanger.add(eStop)

  // Proteção frontal translúcida e barra luminosa de status da CNC.
  const glass = addBox(root, [4.35, 0.92, 0.035], [0, 2.55, 1.72], materials.glass, false)
  glass.userData.machineName = name
  addBox(root, [1.05, 0.08, 0.04], [0, 3.99, 1.72], materials.lightBar, false)

  // Console lateral com gabinete, monitor identificado e botões físicos.
  const console = new THREE.Group()
  console.position.set(3.34, 0, 0.95)
  root.add(console)
  addBox(console, [0.78, 1.5, 0.66], [0, 0.88, 0], materials.steel)
  addBox(console, [0.74, 0.22, 0.68], [0, 1.72, 0], materials.machine)
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#d5ffe6',
    emissive: '#0056a8',
    emissiveIntensity: 1.2,
    map: makeLabelTexture(name, 'CNC / RUN'),
  })
  const screen = addBox(console, [0.62, 0.42, 0.045], [0, 1.24, 0.35], screenMaterial, false)
  screen.userData.machineName = name
  addBox(console, [0.54, 0.07, 0.04], [0, 0.92, 0.36], materials.machine, false)
  for (const [buttonX, buttonMaterial] of [[-0.18, materials.lightBar], [0.02, materials.buttonGreen], [0.2, materials.machine]]) {
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 12), buttonMaterial)
    button.rotation.x = Math.PI / 2
    button.position.set(buttonX, 0.76, 0.35)
    console.add(button)
  }

  // Placa superior, aro que destaca a máquina selecionada e luz de status.
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.55),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(name, 'CNC / CELL'), transparent: true, toneMapped: false }),
  )
  label.position.set(0, 7.75, 0.78)
  root.add(label)
  const focusRing = new THREE.Mesh(
    new THREE.RingGeometry(3.25, 3.34, 64),
    new THREE.MeshBasicMaterial({ color: '#e36b2c', side: THREE.DoubleSide, transparent: true, opacity: 0.015, depthWrite: false }),
  )
  focusRing.rotation.x = -Math.PI / 2
  focusRing.position.y = 0.015
  focusRing.userData.machineName = name
  root.add(focusRing)
  const signal = new THREE.PointLight('#e36b2c', 0, 6, 2)
  signal.position.set(0, 5.25, 0.6)
  root.add(signal)
  // Guarda referências usadas pelo loop de animação sem buscar objetos na cena.
  root.userData.headStage = headStage
  root.userData.cAxis = cAxis
  root.userData.drillRotor = drillRotor
  root.userData.carriage = carriage
  root.userData.dragChain = { curve: dragChainCurve, links: dragChainLinks }
  root.userData.tables = tables
  root.userData.focusRing = focusRing
  root.userData.signal = signal
  return root
}

// Cria pallet base e empilha a quantidade solicitada de tábuas.
function createPallet(scene, materials, x, z, count = 4) {
  const pallet = new THREE.Group()
  pallet.position.set(x, 0, z)
  scene.add(pallet)
  addBox(pallet, [1.8, 0.14, 1.15], [0, 0.12, 0], materials.pallet)
  for (let index = 0; index < 3; index += 1) {
    addBox(pallet, [0.16, 0.18, 1.08], [-0.64 + index * 0.64, 0.25, 0], materials.wood)
  }
  for (let index = 0; index < count; index += 1) {
    const board = addBox(pallet, [1.62, 0.16, 0.78], [0, 0.4 + index * 0.17, 0], index % 2 ? materials.woodLight : materials.wood)
    board.rotation.y = (index % 2 ? -1 : 1) * 0.015
  }
  return pallet
}

// Prateleira de estoque: montantes, travessas metálicas e cargas de madeira.
function createRack(scene, materials, x) {
  const rack = new THREE.Group()
  rack.position.x = x
  scene.add(rack)
  for (const z of [-7, -3, 1, 5]) {
    for (const side of [-1, 1]) {
      addBox(rack, [0.12, 5.2, 0.12], [side * 1.65, 2.6, z], materials.steel)
    }
    for (const y of [1.2, 2.8, 4.4]) {
      addBox(rack, [3.4, 0.12, 0.12], [0, y, z], materials.steel)
      addBox(rack, [2.9, 0.72, 1.45], [0, y + 0.48, z], materials.wood, false)
    }
  }
}

// Caminhão da expedição: chassi, baú, cabine detalhada, faróis, lanternas, logo e rodas.
function createTruck(scene, materials) {
  const truck = new THREE.Group()
  truck.position.set(14.4, 0, 8.2)
  scene.add(truck)

  // Chassi
  addBox(truck, [5.8, 0.28, 1.9], [0.7, 0.55, 0], materials.base)
  // Esteio / longarina lateral
  addBox(truck, [5.9, 0.12, 0.18], [0.7, 0.72, -0.92], materials.steel)
  addBox(truck, [5.9, 0.12, 0.18], [0.7, 0.72,  0.92], materials.steel)
  // Para-choque dianteiro
  addBox(truck, [0.42, 0.38, 2.1], [4.62, 0.55, 0], materials.steel)

  // Baú (trailer)
  addBox(truck, [5.1, 2.6, 2.55], [-0.55, 2.15, 0], materials.trailer)
  // Teto do baú com leve saliência (aerofólio)
  addBox(truck, [5.14, 0.14, 2.62], [-0.55, 3.46, 0], materials.trailer)
  // Friso vertical na lateral (2 faixas)
  addBox(truck, [5.08, 0.08, 0.04], [-0.55, 1.95,  1.29], materials.cab)
  addBox(truck, [5.08, 0.08, 0.04], [-0.55, 2.42,  1.29], materials.cab)
  addBox(truck, [5.08, 0.08, 0.04], [-0.55, 1.95, -1.29], materials.cab)
  addBox(truck, [5.08, 0.08, 0.04], [-0.55, 2.42, -1.29], materials.cab)
  // Porta traseira (2 folhas) + moldura
  addBox(truck, [0.08, 2.2, 1.1], [-3.08, 2.15, -0.62], materials.steel)
  addBox(truck, [0.08, 2.2, 1.1], [-3.08, 2.15,  0.62], materials.steel)
  addBox(truck, [0.06, 2.35, 2.35], [-3.02, 2.15,  0], materials.frame)
  // Lanternas traseiras (vermelho e âmbar)
  addBox(truck, [0.1, 0.18, 0.32], [-3.12, 0.9,  1.02], new THREE.MeshStandardMaterial({ color: '#b8322a', emissive: '#6e1a17', emissiveIntensity: 0.4, roughness: 0.3 }), false)
  addBox(truck, [0.1, 0.18, 0.32], [-3.12, 0.9, -1.02], new THREE.MeshStandardMaterial({ color: '#b8322a', emissive: '#6e1a17', emissiveIntensity: 0.4, roughness: 0.3 }), false)
  addBox(truck, [0.1, 0.14, 0.24], [-3.12, 0.66,  1.0], new THREE.MeshStandardMaterial({ color: '#e9a43a', emissive: '#a0611a', emissiveIntensity: 0.4, roughness: 0.3 }), false)
  addBox(truck, [0.1, 0.14, 0.24], [-3.12, 0.66, -1.0], new THREE.MeshStandardMaterial({ color: '#e9a43a', emissive: '#a0611a', emissiveIntensity: 0.4, roughness: 0.3 }), false)

  // Cabine
  addBox(truck, [2.0, 2.1, 2.45], [3.35, 1.95, 0], materials.cab)
  // Topo da cabine (spoiler leve)
  addBox(truck, [2.0, 0.16, 2.52], [3.35, 2.98, 0], materials.cab)
  // Para-brisa dianteiro (vidro azulado)
  const windshield = addBox(truck, [0.08, 0.9, 1.8], [4.32, 2.48, 0], materials.glass, false)
  windshield.rotation.z = -0.22
  windshield.position.x += 0.06
  // Vidros laterais
  addBox(truck, [1.4, 0.82, 0.06], [3.62, 2.22,  1.24], materials.glass, false)
  addBox(truck, [1.4, 0.82, 0.06], [3.62, 2.22, -1.24], materials.glass, false)
  // Vidro traseiro da cabine (separador)
  addBox(truck, [0.06, 0.82, 1.8], [2.37, 2.22, 0], materials.glass, false)
  // Pilares A (cantos dianteiros)
  addBox(truck, [0.12, 1.4, 0.1], [4.3, 2.3,  0.95], materials.cab)
  addBox(truck, [0.12, 1.4, 0.1], [4.3, 2.3, -0.95], materials.cab)
  // Portas + frisos
  addBox(truck, [0.06, 1.45, 0.95], [3.7, 1.78,  1.24], materials.steel)
  addBox(truck, [0.06, 1.45, 0.95], [3.7, 1.78, -1.24], materials.steel)
  addBox(truck, [0.04, 0.05, 0.35], [3.72, 1.88,  1.25], materials.frame)
  addBox(truck, [0.04, 0.05, 0.35], [3.72, 1.88, -1.25], materials.frame)
  // Maçanetas
  addBox(truck, [0.05, 0.04, 0.12], [3.72, 1.82,  1.02], materials.steel)
  addBox(truck, [0.05, 0.04, 0.12], [3.72, 1.82, -1.02], materials.steel)
  // Espelhos retrovisores
  addBox(truck, [0.18, 0.3, 0.12], [4.15, 2.2,  1.45], materials.steel)
  addBox(truck, [0.18, 0.3, 0.12], [4.15, 2.2, -1.45], materials.steel)
  addBox(truck, [0.05, 0.28, 0.22], [4.28, 2.2,  1.55], materials.glass, false)
  addBox(truck, [0.05, 0.28, 0.22], [4.28, 2.2, -1.55], materials.glass, false)
  // Suporte do espelho
  addBox(truck, [0.04, 0.6, 0.04], [4.2, 2.0,  1.45], materials.steel)
  addBox(truck, [0.04, 0.6, 0.04], [4.2, 2.0, -1.45], materials.steel)
  // Faróis dianteiros
  const headlight = new THREE.MeshStandardMaterial({ color: '#e9f0f0', emissive: '#a6c9cd', emissiveIntensity: 0.4, roughness: 0.2 })
  addBox(truck, [0.2, 0.22, 0.32], [4.76, 0.95,  0.7], headlight, false)
  addBox(truck, [0.2, 0.22, 0.32], [4.76, 0.95, -0.7], headlight, false)
  // Grade inferior dianteira
  addBox(truck, [0.14, 0.3, 1.1], [4.72, 0.56, 0], materials.base)
  for (let i = -4; i <= 4; i += 1) {
    addBox(truck, [0.12, 0.02, 1.0], [4.72, 0.56 + i * 0.032, 0], materials.steel)
  }
  // Placa dianteira
  addBox(truck, [0.16, 0.22, 0.44], [4.8, 0.74, 0], new THREE.MeshStandardMaterial({ color: '#f1e9c0', roughness: 0.7 }))

  // Logo lateral
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 0.78),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture('SYNCRO MOV', 'TECNOLOGIA E INOVAÇÃO'), toneMapped: false }),
  )
  logo.position.set(-0.4, 2.15, 1.3)
  truck.add(logo)
  const logo2 = logo.clone()
  logo2.position.z = -1.3
  logo2.rotation.y = Math.PI
  truck.add(logo2)

  // Rodas:
  //   Eixo dianteiro: 2 rodas simples
  //   Eixos traseiros (2): cada um com 4 rodas (par duplo)
  const addWheel = (x, z, r = 0.48, w = 0.26) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 22), materials.tire)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, r, z)
    wheel.castShadow = true
    truck.add(wheel)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.42, w + 0.02, 14), materials.steel)
    hub.rotation.x = Math.PI / 2
    hub.position.set(x, r, z)
    truck.add(hub)
  }
  // Dianteiro
  for (const z of [-1.02, 1.02]) addWheel(3.9, z)
  // Traseiro (2 eixos, cada um com 2 rodas/lado)
  for (const x of [-1.7, -0.6]) {
    for (const zSide of [-1, 1]) {
      addWheel(x, zSide * 0.82, 0.5, 0.22)
      addWheel(x, zSide * 1.12, 0.5, 0.22)
    }
  }
  // Paralama (asa de roda) traseiro
  addBox(truck, [2.2, 0.22, 2.55], [-1.15, 1.02, 0], materials.trailer)
}

// Empilhadeira com contrapeso traseiro, cabine, mastro duplo, carruagem e garfos.
function createForklift(scene, materials) {
  const forklift = new THREE.Group()
  scene.add(forklift)

  // Rodas (colocamos antes para definir o nível do chassi)
  const addWheel = (x, z, r, w) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 18), materials.tire)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, r, z)
    wheel.castShadow = true
    forklift.add(wheel)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, w + 0.02, 12), materials.steel)
    hub.rotation.x = Math.PI / 2
    hub.position.set(x, r, z)
    forklift.add(hub)
  }
  // Dianteiras (maiores)
  for (const z of [-0.6, 0.6]) addWheel(0.6, z, 0.34, 0.22)
  // Traseiras (menores, dentro do contrapeso)
  for (const z of [-0.5, 0.5]) addWheel(-0.7, z, 0.26, 0.18)

  // Chassi principal + contrapeso traseiro (parte de baixo)
  addBox(forklift, [1.6, 0.46, 1.25], [-0.18, 0.72, 0], materials.forklift)
  // Contrapeso traseiro elevado (a parte característica de trás)
  addBox(forklift, [0.8, 0.9, 1.22], [-0.92, 1.28, 0], materials.forklift)
  // Arredondamento simulado do contraposto (2 camadas)
  addBox(forklift, [0.62, 0.7, 1.2], [-1.02, 1.38, 0], materials.forklift)
  // Tampa do motor / compartimento traseiro
  addBox(forklift, [0.76, 0.1, 1.15], [-0.94, 1.75, 0], materials.steel)
  // Grade de ventilação traseira
  for (let i = 0; i < 4; i += 1) {
    addBox(forklift, [0.04, 0.08, 0.8], [-1.32, 1.15 + i * 0.12, 0], materials.base)
  }
  // Farol traseiro / lanterna
  addBox(forklift, [0.06, 0.12, 0.28], [-1.3, 1.65,  0.38], new THREE.MeshStandardMaterial({ color: '#b8322a', emissive: '#6e1a17', emissiveIntensity: 0.4 }), false)
  addBox(forklift, [0.06, 0.12, 0.28], [-1.3, 1.65, -0.38], new THREE.MeshStandardMaterial({ color: '#b8322a', emissive: '#6e1a17', emissiveIntensity: 0.4 }), false)

  // Chassi dianteiro (suporte das rodas + base do mastro)
  addBox(forklift, [0.5, 0.3, 1.3], [0.75, 0.62, 0], materials.forklift)
  addBox(forklift, [0.36, 0.22, 1.35], [0.92, 0.48, 0], materials.steel)

  // Cabine: piso + assento + console + colunas + teto (overhead guard)
  // Piso da cabine
  addBox(forklift, [0.8, 0.06, 1.08], [-0.2, 0.98, 0], materials.steel)
  // Assento
  addBox(forklift, [0.5, 0.16, 0.56], [-0.42, 1.12, 0], materials.base)
  // Encosto do assento
  addBox(forklift, [0.14, 0.56, 0.58], [-0.66, 1.48, 0], materials.base)
  // Console lateral + volante
  addBox(forklift, [0.4, 0.22, 0.38], [-0.1, 1.26,  0.42], materials.steel)
  addBox(forklift, [0.4, 0.22, 0.38], [-0.1, 1.26, -0.42], materials.steel)
  // Coluna de direção + volante
  addBox(forklift, [0.1, 0.36, 0.1], [0.1, 1.2, 0], materials.steel)
  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), materials.steel)
  steering.rotation.x = Math.PI / 2.3
  steering.position.set(0.16, 1.42, 0)
  forklift.add(steering)
  // 4 colunas do overhead guard (teto de proteção)
  for (const x of [-0.68, 0.32]) {
    for (const z of [-0.56, 0.56]) {
      addBox(forklift, [0.08, 1.4, 0.08], [x, 2.2, z], materials.steel)
    }
  }
  // Teto da cabine (grelha de proteção)
  addBox(forklift, [1.18, 0.08, 1.28], [-0.18, 2.92, 0], materials.steel)
  addBox(forklift, [0.06, 0.06, 1.28], [-0.3, 2.88, 0], materials.forklift)
  addBox(forklift, [0.06, 0.06, 1.28], [0.0, 2.88, 0], materials.forklift)
  // Para-brisa dianteiro (vidro)
  addBox(forklift, [0.06, 0.95, 1.0], [0.3, 2.3, 0], materials.glass, false)

  // Mastro duplo (três estágios mínimos: externo fixo, interno deslizante, e carruagem)
  // Trilhos externos (fixos no chassi dianteiro)
  for (const z of [-0.5, 0.5]) {
    addBox(forklift, [0.14, 2.5, 0.14], [1.02, 1.8, z], materials.steel)
  }
  // Travessa superior do mastro externo
  addBox(forklift, [0.1, 0.14, 1.2], [1.04, 3.05, 0], materials.steel)
  // Rolos / guias superiores
  for (const z of [-0.48, 0.48]) {
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12), materials.roller)
    roller.rotation.y = Math.PI / 2
    roller.position.set(1.02, 3.02, z)
    forklift.add(roller)
  }
  // Mastro interno (segundo estágio, fica um pouco à frente)
  for (const z of [-0.34, 0.34]) {
    addBox(forklift, [0.12, 2.1, 0.12], [1.16, 1.9, z], materials.frame)
  }
  addBox(forklift, [0.1, 0.12, 0.82], [1.18, 2.92, 0], materials.frame)
  // Carruagem (backrest) desliza no mastro interno — frente do conjunto
  addBox(forklift, [0.1, 0.7, 0.96], [1.32, 1.05, 0], materials.frame)
  // Suporte dos garfos (barra transversal na carruagem)
  addBox(forklift, [0.14, 0.1, 1.02], [1.36, 0.78, 0], materials.steel)
  // Garfos (2 lâminas compridas para frente, apoiados no chassi)
  const forkMat = materials.steel
  addBox(forklift, [0.14, 0.1, 1.04], [1.36, 0.54,  0.32], forkMat)
  addBox(forklift, [0.14, 0.1, 1.04], [1.36, 0.54, -0.32], forkMat)
  addBox(forklift, [1.1, 0.1, 0.14], [1.88, 0.44,  0.32], forkMat)
  addBox(forklift, [1.1, 0.1, 0.14], [1.88, 0.44, -0.32], forkMat)
  // Ponta reforçada dos garfos
  addBox(forklift, [0.22, 0.12, 0.16], [2.38, 0.45,  0.32], materials.steel)
  addBox(forklift, [0.22, 0.12, 0.16], [2.38, 0.45, -0.32], materials.steel)

  // Cilindro hidráulico (central no mastro)
  addBox(forklift, [0.1, 1.9, 0.1], [0.98, 1.7, 0], materials.frame)
  const cylPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 12), materials.steel)
  cylPiston.position.set(0.98, 2.4, 0)
  forklift.add(cylPiston)

  // Faróis dianteiros (2 no topo do mastro)
  const headMat = new THREE.MeshStandardMaterial({ color: '#eef5f5', emissive: '#bcd9df', emissiveIntensity: 0.5, roughness: 0.25 })
  addBox(forklift, [0.16, 0.16, 0.22], [1.05, 3.14,  0.32], headMat, false)
  addBox(forklift, [0.16, 0.16, 0.22], [1.05, 3.14, -0.32], headMat, false)

  // Pallet dianteiro (opcional, o userData.pallet é usado depois)
  forklift.userData.pallet = createPallet(forklift, materials, 2.3, 0.22, 2.4)
  return forklift
}

// Constrói o galpão e retorna os objetos que precisam se mover na animação.
function buildFactory(scene) {
  // Materiais compartilhados por função: estrutura, metal, madeira, vidro e veículos.
  const materials = {
    floor: makeMaterial('#202935', 0.2, 0.82),
    machine: makeMaterial('#123a5d', 0.72, 0.3),
    base: makeMaterial('#263a44', 0.66, 0.48),
    steel: makeMaterial('#c3cbd0', 0.82, 0.25),
    frame: makeMaterial('#e5e8eb', 0.62, 0.27),
    chainLink: makeMaterial('#101820', 0.48, 0.42),
    chainLinkAlt: makeMaterial('#25313b', 0.58, 0.38),
    buttonGreen: makeMaterial('#35a875', 0.25, 0.32, { emissive: '#13734a', emissiveIntensity: 0.5 }),
    cutGroove: makeMaterial('#704b32', 0.05, 0.88),
    wood: makeMaterial('#9c6841', 0.08, 0.68),
    woodLight: makeMaterial('#bd8a5a', 0.08, 0.62),
    pallet: makeMaterial('#63462f', 0.02, 0.85),
    glass: makeMaterial('#87b5cd', 0.2, 0.17, { transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
    lightBar: new THREE.MeshStandardMaterial({ color: '#f7a16f', emissive: '#e36b2c', emissiveIntensity: 1.6, roughness: 0.3 }),
    bit: makeMaterial('#d5e2dc', 0.92, 0.18),
    window: makeMaterial('#294f65', 0.35, 0.2, { emissive: '#18384d', emissiveIntensity: 0.4 }),
    trailer: makeMaterial('#d2d8d1', 0.35, 0.48),
    cab: makeMaterial('#0056a8', 0.45, 0.4),
    tire: makeMaterial('#111715', 0.08, 0.84),
    forklift: makeMaterial('#e36b2c', 0.32, 0.46),
    roller: makeMaterial('#56635d', 0.78, 0.35),
    belt: makeMaterial('#202a27', 0.25, 0.7),
  }

  // Piso e grade de referência desenhada no chão do galpão.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(52, 36), materials.floor)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.04
  floor.receiveShadow = true
  scene.add(floor)
  const grid = new THREE.GridHelper(52, 52, '#5a7380', '#53656d')
  grid.position.y = -0.015
  grid.material.transparent = true
  grid.material.opacity = 0.1
  scene.add(grid)

  // Pilares, vigas laterais e travessas superiores que representam o galpão.
  for (const x of [-19, -13, -7, -1, 5, 11, 17, 23]) {
    for (const z of [-13, 13]) {
      addBox(scene, [0.26, 7.5, 0.26], [x, 3.75, z], materials.steel)
    }
  }
  for (const z of [-13, 13]) {
    addBox(scene, [42, 0.2, 0.24], [2, 7.5, z], materials.steel)
    for (const x of [-16, -4, 8, 20]) {
      addBox(scene, [0.18, 0.16, 26], [x, 7.2, 0], materials.steel)
    }
  }

  // Posiciona as três células CNC entre as prateleiras de estoque.
  const machines = machineNames.map((name, index) => createCncCell(scene, name, -7 + index * 7, materials))
  createRack(scene, materials, -16.7)
  createRack(scene, materials, 17.8)

  // Esteira central: correia imóvel, roletes fixos e painéis móveis de madeira.
  const conveyor = new THREE.Group()
  conveyor.position.set(0, 0, 4.6)
  scene.add(conveyor)
  addBox(conveyor, [23, 0.36, 1.55], [0, 0.8, 0], materials.belt)
  for (let index = 0; index < 32; index += 1) {
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 12), materials.roller)
    roller.rotation.z = Math.PI / 2
    roller.position.set(-11.1 + index * 0.72, 1, 0)
    roller.castShadow = true
    conveyor.add(roller)
  }
  const movingPanels = []
  for (let index = 0; index < 4; index += 1) {
    const panel = addBox(conveyor, [1.9, 0.14, 1.05], [-8 + index * 5.3, 1.16, 0], index % 2 ? materials.woodLight : materials.wood)
    movingPanels.push(panel)
  }

  // Elementos da expedição: pallets prontos, caminhão e empilhadeira animada.
  createPallet(scene, materials, -20, 8.3, 5)
  createPallet(scene, materials, -20, 5.9, 3)
  createTruck(scene, materials)
  const forklift = createForklift(scene, materials)

  // Luminárias do teto para iluminar diferentes pontos da linha de produção.
  for (const x of [-15, -7, 1, 9, 17]) {
    const lamp = new THREE.PointLight('#d9ffe6', 45, 7, 2)
    lamp.position.set(x, 6.6, 0)
    scene.add(lamp)
  }

  return { materials, machines, movingPanels, forklift }
}

// Componente React responsável pelo canvas 3D e pelos controles sobrepostos.
function IndustrialScene({ activeMachine, onSelectMachine }) {
  // Referências para a seção de scroll, o host do canvas e a máquina selecionada.
  const sectionRef = useRef(null)
  const hostRef = useRef(null)
  const activeMachineRef = useRef(activeMachine)
  const cameraFocusRequestRef = useRef(null)
  // Progresso de scroll controla a saída da introdução e a entrada do card.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const introOpacity = useTransform(scrollYProgress, [0, 0.26], [1, 0])
  const introY = useTransform(scrollYProgress, [0, 0.26], [0, -32])
  const precisionOpacity = useTransform(scrollYProgress, [0, 0.32, 0.42, 0.94, 1], [0, 0, 1, 1, 0])
  const precisionY = useTransform(scrollYProgress, [0, 0.32, 0.42, 0.94, 1], [14, 14, 0, 0, -18])
  const precisionScale = useTransform(scrollYProgress, [0, 0.32, 0.42, 0.94, 1], [0.96, 0.96, 1, 1, 0.98])

  // Sincroniza seleção React com o loop de animação sem recriar a cena.
  useEffect(() => {
    activeMachineRef.current = activeMachine
  }, [activeMachine])

  // Inicializa a cena Three.js uma vez e registra seus eventos/recursos.
  useEffect(() => {
    const host = hostRef.current
    const section = sectionRef.current
    if (!host || !section) return undefined

    // Cena raiz, cor de fundo escura e névoa para dar profundidade ao galpão.
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0f19')
    scene.fog = new THREE.FogExp2('#0b0f19', 0.008)

    // A câmera percorre uma curva conforme o scroll; targetPath define seu foco.
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 120)
    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(24, 21, 27),
      new THREE.Vector3(17, 14, 22),
      new THREE.Vector3(6, 9, 17),
      new THREE.Vector3(-7, 8, 16),
      new THREE.Vector3(17, 12, 22),
    ])
    const targetPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1.3, 0),
      new THREE.Vector3(1, 1.5, 1),
      new THREE.Vector3(-2, 1.5, 2),
      new THREE.Vector3(14, 1, 8),
    ])

    // Renderer WebGL: antialias, sombras, gerenciamento de cor e canvas acessível.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.domElement.setAttribute('aria-label', 'Animação 3D de uma fábrica CNC e centro de expedição')
    renderer.domElement.setAttribute('role', 'img')
    renderer.domElement.className = 'absolute inset-0 h-full w-full'
    host.appendChild(renderer.domElement)

    // Luz ambiente do céu e luz direcional principal que projeta sombras.
    scene.add(new THREE.HemisphereLight('#dceee1', '#1a251f', 2.1))
    const keyLight = new THREE.DirectionalLight('#f2f1df', 4.1)
    keyLight.position.set(-12, 24, 16)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.left = -28
    keyLight.shadow.camera.right = 28
    keyLight.shadow.camera.top = 28
    keyLight.shadow.camera.bottom = -28
    keyLight.shadow.bias = -0.0002
    scene.add(keyLight)

    // Constrói os modelos e cria auxiliares reutilizados em cliques/animação.
    const factory = buildFactory(scene)
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(2, 2)
    const lookTarget = new THREE.Vector3()
    const desiredCameraPosition = new THREE.Vector3()
    const desiredTarget = new THREE.Vector3()
    const cameraDirection = new THREE.Vector3()
    let frameId = 0
    let elapsed = 0
    let lastTime = 0
    let scrollProgress = 0
    let pointerX = 0
    let hoveredMachine = null
    let focusedCamera = null
    let lastScrollY = window.scrollY

    // Raycasting sob o cursor identifica e seleciona a CNC em foco.
    const handlePointerMove = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1)
      pointerX = pointer.x
      raycaster.setFromCamera(pointer, camera)
      const hovered = raycaster.intersectObjects(scene.children, true).find((item) => item.object.userData.machineName)?.object.userData.machineName || null
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab'
      if (hovered && hovered !== hoveredMachine) onSelectMachine(hovered)
      hoveredMachine = hovered
    }

    // Raycasting no clique encontra a CNC atingida e avisa o componente React.
    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera)
      const intersections = raycaster.intersectObjects(scene.children, true)
      const clickedMachine = intersections.find((item) => item.object.userData.machineName)?.object.userData.machineName
      if (clickedMachine) onSelectMachine(clickedMachine)
    }

    // Converte a rolagem da seção para um valor normalizado entre 0 e 1.
    const handleScroll = () => {
      // Um novo movimento de scroll retorna a câmera ao percurso original.
      if (window.scrollY !== lastScrollY) {
        focusedCamera = null
        cameraFocusRequestRef.current = null
        lastScrollY = window.scrollY
      }
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
      scrollProgress = THREE.MathUtils.clamp(-section.getBoundingClientRect().top / distance, 0, 1)
    }

    // Atualiza proporção da câmera e dimensões do WebGL ao redimensionar.
    const resizeObserver = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    })
    resizeObserver.observe(host)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Loop principal por frame: calcula tempo, câmera e movimentos da fábrica.
    const animate = (time) => {
      frameId = window.requestAnimationFrame(animate)
      const delta = Math.min((time - lastTime) / 1000 || 0, 0.05)
      lastTime = time
      elapsed += delta

      // Suavização cúbica evita trancos na trajetória da câmera durante o scroll.
      const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)
      const routeProgress = THREE.MathUtils.clamp(easedProgress + pointerX * 0.012, 0, 1)
      cameraPath.getPointAt(routeProgress, desiredCameraPosition)
      targetPath.getPointAt(routeProgress, desiredTarget)
      cameraDirection.copy(desiredTarget).sub(desiredCameraPosition).normalize()
      desiredCameraPosition.addScaledVector(cameraDirection, THREE.MathUtils.smoothstep(scrollProgress, 0, 0.38) * 2.8)

      // Um clique no seletor pede um enquadramento frontal para a máquina escolhida.
      const requestedMachineName = cameraFocusRequestRef.current
      if (requestedMachineName) {
        const requestedMachine = factory.machines.find(
          (machine) => machine.userData.machineName === requestedMachineName,
        )
        if (requestedMachine) {
          const machinePosition = requestedMachine.getWorldPosition(new THREE.Vector3())
          focusedCamera = {
            position: machinePosition.clone().add(new THREE.Vector3(2.4, 4.4, 15)),
            target: machinePosition.clone().add(new THREE.Vector3(0, 4, 0)),
          }
        }
        cameraFocusRequestRef.current = null
      }

      if (focusedCamera) {
        const focusEase = 1 - Math.exp(-delta * 2.4)
        camera.position.lerp(focusedCamera.position, focusEase)
        lookTarget.lerp(focusedCamera.target, focusEase)
      } else {
        camera.position.copy(desiredCameraPosition)
        lookTarget.lerp(desiredTarget, 0.045)
      }
      camera.lookAt(lookTarget)

      // Ciclo de cada CNC: mesas, carro transversal, descida e rotação da fresa.
      factory.machines.forEach((machine, index) => {
        const isActive = machine.userData.machineName === activeMachineRef.current
        machine.userData.tables.forEach((table) => {
          table.position.z = Math.sin(elapsed * 0.36 + (table.userData.slidePhase || 0)) * 0.12
        })

        // Ciclo ÚNICO fechado (contínuo em cycleT=0 e cycleT=1):
        //   Cada período contém 2 passagens de corte (1 em cada mesa) + 2 translados rápidos.
        //   Com isso não há descontinuidade no wrap (volta ao mesmo X/Y/Z do início).
        //   0.00 - 0.26  => CORTE LENTO na mesa 0
        //   0.26 - 0.34  => SUBIDA RÁPIDA + translado rápido até mesa 1
        //   0.34 - 0.60  => CORTE LENTO na mesa 1
        //   0.60 - 0.68  => SUBIDA RÁPIDA + translado rápido até mesa 0 (fechamento)
        //   0.68 - 1.00  => (folga: repetimos corte 0 + translado 0->1 para manter período;
        //                    na prática usamos o ciclo completo 0..1 como "2 mesas em sequência")
        //
        //   Na verdade, para ser simples e fechado: 4 blocos (tamanhos iguais, 0.25 cada):
        //     [0.00, 0.36] CORTE LENTO na mesa A (0.36 = 36% do ciclo)
        //     [0.36, 0.50] TRANSLADO RÁPIDO A -> B (sobe + move X/Z)
        //     [0.50, 0.86] CORTE LENTO na mesa B (0.36 = 36% do ciclo)
        //     [0.86, 1.00] TRANSLADO RÁPIDO B -> A (sobe + move X/Z, fecha o ciclo)
        const cyclePeriod = index === 1 ? 5.2 : 6.6
        const cycleOffset = index * 2.1
        const cycleT = ((elapsed + cycleOffset) % cyclePeriod) / cyclePeriod
        const tables = machine.userData.tables
        const tableA = tables[0]
        const tableB = tables[1]

        // Constantes geométricas
        const cutRangeX = 1.65
        const highY = 0.18
        const lowY = -0.58

        // Helpers: smoothstep C1 contínuo, smootherstep C2 contínuo
        const ss = (t) => t * t * (3 - 2 * t)
        const sss = (t) => t * t * t * (10 - 15 * t + 6 * t * t)

        // Calcula a passagem de corte LENTA sobre uma mesa (parâmetro u = 0..1 dentro do corte).
        // Retorna {x, z, yStroke: 0..1 (1 = totalmente descido)}
        // Garante: em u=0 e u=1 -> x = mesaX - cutRangeX*0.5, yStroke = 1, z = mesaZ (valor estável na entrada/saída)
        const cutPass = (table, u) => {
          // sweep: começa em -1 (u=0), vai para 0 (u=0.5), volta para -1 (u=1) — sai pelo mesmo lado que entrou
          // Ou melhor: entra pela esquerda (-1), vai até direita (+1) — ida só, e na saída já está na direita.
          // Para ser fechado com o próximo translado, vamos: entrada pela ESQUERDA, saída pela DIREITA.
          const sweep = -1 + 2 * sss(u) // de -1 a +1 suavemente (C2)
          const x = table.position.x + sweep * cutRangeX * 0.5
          const z = table.position.z + Math.sin(u * Math.PI) * 0.07
          const yStroke = 1 - Math.cos(u * Math.PI * 2) * 0.03 // fica em 1.0, oscila +/- 0.03 (profundidade de corte)
          return { x, z, yStroke }
        }

        // Translado RÁPIDO entre duas mesas: de (tableFrom, lado=ladoFrom) até (tableTo, lado=ladoTo)
        // lado: -1 = esquerda da mesa, +1 = direita da mesa
        // u = 0..1, transição C2.
        const translatePass = (tableFrom, ladoFrom, tableTo, ladoTo, u) => {
          const k = sss(u)
          const xFrom = tableFrom.position.x + ladoFrom * cutRangeX * 0.5
          const xTo = tableTo.position.x + ladoTo * cutRangeX * 0.5
          const zFrom = tableFrom.position.z
          const zTo = tableTo.position.z
          // yStroke desce de 1 -> 0 no começo, volta 0 -> 1 no fim? NÃO: translado = cabeçote SEMPRE alto
          // Entrada: se vem de um corte, yStroke deve começar em 1 (baixo) e subir para 0 (alto) rapidamente
          // Mas aqui vamos manter 0 o tempo todo (alto), e o encadeamento garante.
          const x = THREE.MathUtils.lerp(xFrom, xTo, k)
          const z = THREE.MathUtils.lerp(zFrom, zTo, k)
          // Altura: começa e termina em highY, e no meio fica um pouco mais alto para limpar.
          const arc = Math.sin(u * Math.PI) * 0.06
          return { x, z, yStroke: 0, yArc: arc }
        }

        let x
        let z
        let yStroke
        let yArc = 0
        let isDrilling

        // Bloco 1 (0.00 - 0.36): CORTE LENTO na mesa A — entra esquerda (-1), sai direita (+1)
        if (cycleT < 0.36) {
          const u = cycleT / 0.36
          const p = cutPass(tableA, u)
          x = p.x
          z = p.z
          yStroke = p.yStroke
          isDrilling = true
          // Janelas de entrada e saída suave no eixo Y (continuidade com translados)
          if (u < 0.04) yStroke = ss(u / 0.04)
          else if (u > 0.96) yStroke = 1
          else {
            const enterT = Math.min(1, u / 0.12)
            yStroke *= ss(enterT)
            yStroke = Math.min(yStroke, 1)
          }
        }
        // Bloco 2 (0.36 - 0.50): TRANSLADO RÁPIDO mesa A direita (+1) -> mesa B esquerda (-1)
        else if (cycleT < 0.50) {
          const u = (cycleT - 0.36) / 0.14
          const p = translatePass(tableA, +1, tableB, -1, u)
          x = p.x
          z = p.z
          yArc = p.yArc
          // yStroke precisa DESCER de 1 (baixo) para 0 (alto) no começo do translado,
          // e ficar 0, e no fim do translado já começar a subir para o corte?
          // NÃO: no translado, SEMPRE cabeçote ALTO. Mas a entrada do bloco 2 precisa casar com saída do bloco 1:
          // saída bloco 1 = yStroke = 1 (baixo). Então temos que subir rapidamente.
          const subir = ss(Math.min(1, u / 0.25)) // primeiros 25% do translado = subida rápida
          yStroke = 1 - subir // de 1 -> 0
          isDrilling = u < 0.05
        }
        // Bloco 3 (0.50 - 0.86): CORTE LENTO na mesa B — entra esquerda (-1), sai direita (+1)
        else if (cycleT < 0.86) {
          const u = (cycleT - 0.50) / 0.36
          const p = cutPass(tableB, u)
          x = p.x
          z = p.z
          yStroke = p.yStroke
          isDrilling = true
          // Janela de descida no começo (match com translado: yStroke=0 -> 1)
          if (u < 0.04) yStroke = ss(u / 0.04)
          else if (u > 0.96) yStroke = 1
        }
        // Bloco 4 (0.86 - 1.00): TRANSLADO RÁPIDO mesa B direita (+1) -> mesa A esquerda (-1) [FECHA O CICLO]
        else {
          const u = (cycleT - 0.86) / 0.14
          const p = translatePass(tableB, +1, tableA, -1, u)
          x = p.x
          z = p.z
          yArc = p.yArc
          const subir = ss(Math.min(1, u / 0.25))
          yStroke = 1 - subir
          isDrilling = u < 0.05
        }

        // APLICAÇÃO DIRETA (sem lerp incremental que causa "gap"):
        // Continuidade é garantida por matching nas fronteiras.
        machine.userData.carriage.position.x = x
        machine.userData.headStage.position.z = z
        machine.userData.headStage.position.y = THREE.MathUtils.lerp(highY, lowY, yStroke) - yArc

        // Fresa gira sempre que estiver em descida/subida/corte
        if (isDrilling || (cycleT > 0.34 && cycleT < 0.52) || (cycleT > 0.84)) {
          machine.userData.drillRotor.rotation.y += delta * 6.2
        }

        // Atualiza posição e orientação dos elos da corrente porta-cabos superior.
        const { curve, links } = machine.userData.dragChain
        const chainEndX = machine.userData.carriage.position.x
        const chainEndY = machine.userData.carriage.position.y + 0.87
        const chainEndZ = machine.userData.carriage.position.z
        curve.v1.set((-2.82 + chainEndX) / 2, 7.5, (0.66 + chainEndZ) / 2)
        curve.v2.set(chainEndX, chainEndY, chainEndZ)
        curve.updateArcLengths()
        const linkCount = THREE.MathUtils.clamp(Math.ceil(curve.getLength() / 0.15), 5, links.length)
        for (let linkIndex = 0; linkIndex < links.length; linkIndex += 1) {
          const link = links[linkIndex]
          link.visible = linkIndex < linkCount
          if (!link.visible) continue
          const t = (linkIndex + 0.5) / linkCount
          const point = curve.getPointAt(t)
          const tangent = curve.getTangentAt(t)
          link.position.copy(point)
          link.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent)
        }

        // Atualiza correntes porta-cabos sob cada mesa móvel.
        machine.userData.tables.forEach((table, tblIdx) => {
          if (!table.userData.chain) return
          const { curve: tCurve, links: tLinks } = table.userData.chain
          const tableSlideZ = table.position.z
          const tEndX = tCurve.v0.x + 1.2 + tblIdx * 0.1
          const tEndZ = tCurve.v0.z + 1.7 + tableSlideZ
          tCurve.v1.set((tCurve.v0.x + tEndX) / 2, 1.32, (tCurve.v0.z + tEndZ) / 2)
          tCurve.v2.set(tEndX, 1.0, tEndZ)
          tCurve.updateArcLengths()
          const tLinkCount = THREE.MathUtils.clamp(Math.ceil(tCurve.getLength() / 0.13), 4, tLinks.length)
          for (let tIdx = 0; tIdx < tLinks.length; tIdx += 1) {
            const tLink = tLinks[tIdx]
            tLink.visible = tIdx < tLinkCount
            if (!tLink.visible) continue
            const tt = (tIdx + 0.5) / tLinkCount
            const tPoint = tCurve.getPointAt(tt)
            const tTangent = tCurve.getTangentAt(tt)
            tLink.position.copy(tPoint)
            tLink.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tTangent)
          }
        })

        // Pulso no aro e luz acesa indicam a máquina ativa na interface.
        machine.userData.focusRing.material.opacity = isActive ? 0.2 + Math.sin(elapsed * 3) * 0.07 : 0.015
        machine.userData.signal.intensity = isActive ? 7.5 : 0
      })
      // Desloca as tábuas da esteira e movimenta a empilhadeira pelo galpão.
      factory.movingPanels.forEach((panel, index) => {
        panel.position.x = ((index * 5.3 + elapsed * 1.35 + 11) % 22) - 11
      })
      factory.forklift.position.set(Math.sin(elapsed * 0.22) * 8, 0, 8.2 + Math.cos(elapsed * 0.22) * 1.2)
      factory.forklift.rotation.y = Math.cos(elapsed * 0.22) > 0 ? 0 : Math.PI

      // Renderiza o estado atualizado da fábrica no canvas.
      renderer.render(scene, camera)
    }
    // Pausa o loop quando a seção não está visível e retoma ao entrar na tela.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frameId) {
        lastTime = 0
        frameId = window.requestAnimationFrame(animate)
      } else if (!entry.isIntersecting && frameId) {
        window.cancelAnimationFrame(frameId)
        frameId = 0
      }
    }, { rootMargin: '100px 0px' })
    visibilityObserver.observe(section)

    // Limpa animação, observadores, eventos, geometrias, materiais e WebGL.
    return () => {
      window.cancelAnimationFrame(frameId)
      visibilityObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('click', handleClick)
      resizeObserver.disconnect()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => {
            if (material.map) material.map.dispose()
            material.dispose()
          })
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onSelectMachine])

  // Interface HTML posicionada sobre o canvas: título, card e botões das CNCs.
  return (
    <section ref={sectionRef} id="fabrica" className="min-h-[165svh] bg-[#0b0f19]">
      <div className="sticky top-[72px] h-[calc(100svh-72px)] min-h-[540px] overflow-hidden bg-[#0b0f19]">
        {/* O renderer insere o canvas Three.js neste contêiner. */}
        <div ref={hostRef} className="absolute inset-0" />
        {/* Gradiente de contraste sobre a cena; não captura cliques do usuário. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,25,.97)_0%,rgba(11,15,25,.88)_30%,rgba(11,15,25,.55)_52%,rgba(11,15,25,.06)_76%),linear-gradient(0deg,rgba(11,15,25,.65)_0%,transparent_28%,transparent_72%,rgba(11,15,25,.4)_100%)] max-md:bg-[linear-gradient(180deg,rgba(11,15,25,.98)_0%,rgba(11,15,25,.91)_40%,rgba(11,15,25,.55)_70%,rgba(11,15,25,.2)_100%)]" />

        {/* Título, explicação da fábrica e links de ação; saem conforme o scroll. */}
        <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute left-5 top-[7%] z-10 w-[calc(100%-2.5rem)] max-w-[690px] sm:left-10 sm:top-[9%] lg:left-16 lg:top-[11%]">
          <p className="flex w-fit items-center gap-2 border border-white/15 bg-[#121722]/80 px-3 py-2 font-mono text-[8px] uppercase tracking-[.16em] text-slate-200 backdrop-blur sm:text-[10px]"><span className="h-1.5 w-1.5 rounded-full bg-[#e36b2c]" /> SYNCRO MOV <span className="text-slate-500">/</span> Produção conectada</p>
          <h1 className="mt-4 text-[clamp(2rem,4.8vw,5.2rem)] font-semibold leading-[.98] tracking-[-.045em] text-white sm:mt-6"><span className="block whitespace-nowrap">Sua fábrica CNC.</span><span className="block whitespace-nowrap text-[#60a5fa]">Em movimento.</span></h1>
          <p className="mt-4 max-w-[500px] text-xs leading-5 text-slate-300 sm:mt-6 sm:text-base sm:leading-7">Reduza o retrabalho e tenha mais controle sobre chapas, ordens e máquinas. Enxergue o que acontece na produção antes que falhas de comunicação virem prejuízo.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <a href="#contato" className="group inline-flex items-center gap-3 bg-[#e36b2c] px-4 py-3 text-[10px] font-semibold text-white transition hover:bg-[#0056a8] sm:px-5 sm:py-4 sm:text-sm">Quero reduzir retrabalho <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-4 sm:w-4" /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-[#e36b2c] pb-2 text-[10px] font-semibold text-white transition hover:text-[#fb923c] sm:text-sm"><span className="h-2 w-2 rounded-full bg-[#e36b2c]" /> Falar pelo WhatsApp</a>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[7px] uppercase tracking-[.12em] text-slate-300 sm:mt-7 sm:text-[9px]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/45" /><span className="relative h-2 w-2 rounded-full bg-blue-400" /></span>Máquinas, apontamento e expedição em um fluxo</div>
        </motion.div>

        {/* Card informativo com atraso, posição e escala ligados ao progresso do scroll. */}
        <motion.aside
          style={{ opacity: precisionOpacity, y: precisionY, scale: precisionScale }}
          className="pointer-events-none absolute bottom-[18%] right-3 z-20 flex w-[340px] max-w-[calc(100%-1.5rem)] items-center gap-3 border border-white/20 bg-slate-950/65 px-4 py-3 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,.32)] backdrop-blur-xl md:right-[9%] md:top-[48%] md:bottom-auto md:px-5 md:py-4"
          aria-label="Processo de fabricação em alta qualidade e precisão"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e36b2c]/40 bg-[#e36b2c]/10 text-[#fb923c]"><BadgeCheck size={19} /></span>
          <span>
            <span className="block font-mono text-[8px] uppercase tracking-[.16em] text-[#fb923c] sm:text-[9px]">Precisão em cada etapa</span>
            <span className="mt-1 block text-xs font-medium leading-5 sm:text-sm">Processo de fabricação em alta qualidade e precisão</span>
          </span>
        </motion.aside>

        {/* Indicadores de operação no topo e fluxo visual entre produção e expedição. */}
        <div className="absolute left-3 top-3 flex items-center gap-2 border border-white/15 bg-[#121722]/80 px-2.5 py-2 font-mono text-[7px] uppercase tracking-[.12em] text-slate-200 backdrop-blur sm:left-6 sm:top-6 sm:px-3 sm:text-[9px]">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e36b2c]/40" /><span className="relative h-2 w-2 rounded-full bg-[#e36b2c]" /></span>
          Unidade 01 <span className="text-slate-500">/</span> Operação ao vivo
        </div>
        <div className="absolute right-3 top-3 hidden items-center gap-2 border border-white/15 bg-[#121722]/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[.13em] text-slate-200 backdrop-blur sm:flex">
          <Truck size={13} className="text-[#e36b2c]" /> Produção <ArrowUpRight size={11} className="text-slate-500" /> Expedição
        </div>
        {/* Seletor das três máquinas; a ativa ganha destaque e acende na cena. */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
          <div className="hidden items-center gap-2 font-mono text-[8px] uppercase tracking-[.13em] text-white drop-shadow sm:flex"><Box size={13} className="text-[#e36b2c]" /> CNC em ciclo <span className="text-white/70">/</span> Madeira em usinagem</div>
          <div className="ml-auto grid w-full max-w-[430px] grid-cols-3 border border-white/15 bg-[#121722]/85 shadow-lg backdrop-blur-xl">
            {machineNames.map((name) => (
              <button key={name} type="button" onClick={() => {
                onSelectMachine(name)
                cameraFocusRequestRef.current = name
              }} aria-pressed={activeMachine === name} className={`border-r border-white/10 px-2 py-2 text-left last:border-0 transition sm:px-4 sm:py-3 ${activeMachine === name ? 'bg-blue-500/20' : 'hover:bg-white/[.05]'}`}>
                <span className="flex items-center gap-2 text-[9px] font-semibold text-white sm:text-xs"><span className={`h-1.5 w-1.5 rounded-full ${activeMachine === name ? 'bg-[#e36b2c] shadow-[0_0_8px_#e36b2c]' : 'bg-slate-500'}`} />{name}</span>
                <span className="mt-1 block truncate pl-3.5 font-mono text-[7px] uppercase tracking-[.1em] text-slate-400 sm:text-[8px]">{activeMachine === name ? 'CNC / ATIVO' : 'CNC / ONLINE'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default IndustrialScene