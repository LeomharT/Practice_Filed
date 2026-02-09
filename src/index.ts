import { ShaderChunk } from 'three';
import { Experience } from './Experience';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const root = document.querySelector('#root');

const el = document.createElement('div');
el.classList.add('viewer');
root?.append(el);

const experience = Experience.instance;
el.append(experience.canvas);
