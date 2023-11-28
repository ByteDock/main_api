import { Router } from 'express';
import { BaseHelper } from './BaseHelper';

export interface Path {
    default: Router;
    setupHelpers?: (helpers: BaseHelper[]) => void;
}