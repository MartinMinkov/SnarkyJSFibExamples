import { FibWithoutRecursion } from './FibWithoutRecursion';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  Party,
} from 'snarkyjs';

function createLocalBlockchain() {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: FibWithoutRecursion,
  zkAppPrivkey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    Party.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivkey });
    zkAppInstance.init();
  });
  await txn.send().wait();
}

describe('FibWithoutRecursion', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey;

  beforeEach(async () => {
    await isReady;
    deployerAccount = createLocalBlockchain();
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  it('generates and deploys the `FibWithoutRecursion` smart contract', async () => {
    const zkAppInstance = new FibWithoutRecursion(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const nthMinus2 = zkAppInstance.nthMinus2.get();
    expect(nthMinus2).toEqual(Field.zero);
    const nthMinus1 = zkAppInstance.nthMinus1.get();
    expect(nthMinus1).toEqual(Field.one);
  });

  it('correctly updates the `FibWithoutRecursion` smart contract -- iteration1', async () => {
    const zkAppInstance = new FibWithoutRecursion(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field.one);
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    const nthMinus2 = zkAppInstance.nthMinus2.get();
    expect(nthMinus2).toEqual(Field.one);
    const nthMinus1 = zkAppInstance.nthMinus1.get();
    expect(nthMinus1).toEqual(Field.one);
  });

  it('correctly updates `FibWithoutRecursion` smart contract -- iteration 2', async () => {
    const zkAppInstance = new FibWithoutRecursion(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    let txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field.one);
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(2));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    const nthMinus2 = zkAppInstance.nthMinus2.get();
    expect(nthMinus2).toEqual(Field.one);
    const nthMinus1 = zkAppInstance.nthMinus1.get();
    expect(nthMinus1).toEqual(Field(2));
  });

  it('correctly updates `FibWithoutRecursion` smart contract -- iteration 3', async () => {
    const zkAppInstance = new FibWithoutRecursion(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    let txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field.one);
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(2));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(3));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    const nthMinus2 = zkAppInstance.nthMinus2.get();
    expect(nthMinus2).toEqual(Field(2));
    const nthMinus1 = zkAppInstance.nthMinus1.get();
    expect(nthMinus1).toEqual(Field(3));
  });

  it('correctly updates `FibWithoutRecursion` smart contract -- iteration 4', async () => {
    const zkAppInstance = new FibWithoutRecursion(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    let txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field.one);
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(2));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(3));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.update(Field(5));
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn.send().wait();

    const nthMinus2 = zkAppInstance.nthMinus2.get();
    expect(nthMinus2).toEqual(Field(3));
    const nthMinus1 = zkAppInstance.nthMinus1.get();
    expect(nthMinus1).toEqual(Field(5));
  });
});
