import {
  FibWithRecursion,
  FibonacciSequence,
  fibProof,
} from './FibWithRecursion';
import {
  isReady,
  shutdown,
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
  zkAppInstance: FibWithRecursion,
  zkAppPrivkey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    Party.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivkey });
  });
  await txn.send().wait();
}

describe('FibWithRecursion', () => {
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

  it('generates and deploys the `FibWithRecursion` smart contract', async () => {
    const zkAppInstance = new FibWithRecursion(zkAppAddress);
    expect(async () => {
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    }).not.toThrow();
  });

  it('correctly verifies with the `FibWithRecursion` smart contract', async () => {
    const zkAppInstance = new FibWithRecursion(zkAppAddress);
    await FibonacciSequence.compile();
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    expect(async () => {
      let finalProof = await fibProof(3);
      const txn = await Mina.transaction(deployerAccount, () => {
        // call out method with final proof from the ZkProgram as argument
        if (finalProof) {
          zkAppInstance.verify(finalProof);
        }
      });
      await txn.send().wait();
    }).not.toThrow();
  });
});
