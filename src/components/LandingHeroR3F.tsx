import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress, Environment, PresentationControls, Float, OrbitControls, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        padding: 8,
        background: 'rgba(255,255,255,0.06)',
        color: 'white',
        borderRadius: 8,
        fontSize: 13,
        minWidth: 160,
        textAlign: 'center'
      }}>
        Loading 3D — {Math.round(progress)}%
      </div>
    </Html>
  );
}

function GLTFModel({ url }: { url: string }) {
  const gltf = useGLTF(url) as any;
  return <primitive object={gltf.scene} dispose={null} />;
}

interface LandingHeroR3FProps {
  modelUrl?: string; // path to .glb/.gltf
  className?: string;
}

const LandingHeroR3F: React.FC<LandingHeroR3FProps> = ({ modelUrl = '/models/pufferfish.glb', className = '' }) => {
  const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const camera = useMemo(() => ({ position: [0, 0, 3.2], fov: 40 }), []);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={camera} pixelRatio={Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<Loader />}>  
          <PresentationControls
            global
            rotation={[0, Math.PI / 12, 0]}
            polar={[-0.25, 0.25]}
            azimuth={[-0.5, 0.5]}
            config={{ mass: 2, tension: 200 }}
            snap={{ mass: 4, tension: 400 }}
          >
            <Float floatIntensity={0.6} rotationIntensity={0.5}>
              {isCoarse ? (
                <mesh>
                  <sphereGeometry args={[0.8, 32, 32]} />
                  <meshStandardMaterial color="#ff6b6b" metalness={0.3} roughness={0.4} />
                </mesh>
              ) : (
                <GLTFModel url={modelUrl} />
              )}
            </Float>
          </PresentationControls>

          <Environment preset="studio" />
        </Suspense>

        {!isCoarse && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.4} height={300} intensity={0.45} />
          </EffectComposer>
        )}

        {!isCoarse && <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.3} />}

      </Canvas>
    </div>
  );
};

export default LandingHeroR3F;