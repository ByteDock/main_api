import { Router } from 'express';
import { BaseHelper } from '../interfaces/BaseHelper';
import { DockerHelper } from '../helpers/DockerHelper';

const router = Router();
let dockerHelper: DockerHelper | null = null;

export function setupHelpers(helpers: BaseHelper[]) {
    helpers.forEach(helper => {
        if (helper instanceof DockerHelper) {
            dockerHelper = helper;
        }
    });
}

router.get('/', (req, res) => {
    res.send('This is the index. :)');
});

export default router;